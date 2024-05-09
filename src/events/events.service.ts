import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Event, Prisma } from '@prisma/client';
import { PrismaService } from 'src/config/prisma/prisma.service';
import {
  CreateEventDto,
  UpdateEventDto,
  UpdateEventStatusDto,
  findAllEventsDto,
} from './dtos/events.dto';
import { ApiResponse } from 'src/common/types/response.type';
import { Express } from 'express';
import * as dayjs from 'dayjs';
import { CloudinaryService } from 'src/config/cloudinary/cloudinary.service';
import { EventImageInfo } from './types/events.types';

@Injectable()
export class EventsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
    data: CreateEventDto,
    file: Express.Multer.File,
    creatorId: string,
  ): Promise<ApiResponse> {
    const isInvalidDate = dayjs(data.datetime).isBefore(dayjs());

    if (isInvalidDate)
      throw new BadRequestException('The date must be in the future');

    const upload = await this.cloudinaryService.uploadFile(file, 'events');

    const event = await this.prismaService.event.create({
      data: {
        ...data,
        thumbnail: upload.secure_url,
        public_id: upload.public_id,
        creatorId,
      },
    });

    return {
      statusCode: HttpStatus.CREATED,
      data: event,
      message: 'Event created successfully',
    };
  }

  async findAll(query: findAllEventsDto): Promise<ApiResponse> {
    const {
      year = dayjs().year(),
      startMonth,
      endMonth,
      groupedByMonth,
      completed,
      order = 'asc',
    } = query;

    const whereOptions: Prisma.EventWhereInput = {};

    /*-----------------------------
      Date range query validation
      ----------------------------- */
    const monthRangeProvided = startMonth && endMonth;
    const isValidMonthRange = endMonth >= startMonth;
    const isSameMonth = startMonth === endMonth;

    if (monthRangeProvided && !isValidMonthRange)
      throw new BadRequestException('Invalid month range');

    // By default, we get all events for the year
    let startOfYear = dayjs().year(year).startOf('year');
    let endOfYear = dayjs().year(year).endOf('year');

    // If startMonth and endMonth query params are provided, we filter the events using the month range
    if (monthRangeProvided) {
      startOfYear = startOfYear.month(startMonth - 1).startOf('month');
      endOfYear = endOfYear.month(endMonth - 1).endOf('month');
    }

    // Add the datetime range to the prisma whereOptions
    whereOptions.datetime = {
      gte: startOfYear.toDate(),
      lte: endOfYear.toDate(),
    };

    /*-----------------------------
      Status query validation
      ----------------------------- */
    if (completed !== undefined) {
      // If the status query param is provided, we filter the events by status
      whereOptions.completed = completed;
    }

    const events = await this.prismaService.event.findMany({
      where: whereOptions,
      orderBy: {
        datetime: order,
      },
      include: {
        images: {
          select: {
            id: true,
            url: true,
          },
        },
      },
    });

    // Filter images based on the 'completed' status of each event
    const processedEvents = events.map((event) => ({
      ...event,
      // If the event is not completed, we don't return the images
      images: event.completed ? event.images : [],
    }));

    /*-------------------------------
      groupByMonth query validation
      ------------------------------- */
    // If the month range is provided and the startMonth and endMonth are the same or if the month range is not provided, we group by month by default
    const defaultGroupByMonth = !monthRangeProvided || !isSameMonth;

    // If groupedByMonth query param is provided, we use it to filter, otherwise we use the default behavior
    const isGroupByMonth = groupedByMonth ?? defaultGroupByMonth;

    return {
      statusCode: HttpStatus.OK,
      data: {
        isGrouped: isGroupByMonth,
        events: isGroupByMonth
          ? this.groupByMonth(processedEvents)
          : processedEvents,
      },
      message: 'Events retrieved successfully',
    };
  }

  async findOne(id: string): Promise<ApiResponse> {
    const event = await this.prismaService.event.findUnique({
      where: {
        id,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            lastname: true,
            email: true,
          },
        },
        images: {
          select: {
            id: true,
            url: true,
            height: true,
            width: true,
          },
        },
      },
    });

    if (!event) throw new NotFoundException('Event not found');

    return {
      statusCode: HttpStatus.OK,
      data: event,
      message: 'Event retrieved successfully',
    };
  }

  async update(
    id: string,
    data: UpdateEventDto,
    file: Express.Multer.File,
  ): Promise<ApiResponse> {
    // Check if the event exists
    const result = await this.findOne(id);

    const currentEvent: Event = result.data;
    const imageInfo: EventImageInfo = {};

    // Check if the date is in the future
    if (data.datetime) {
      const isInvalidDate = dayjs(data.datetime).isBefore(dayjs());

      if (isInvalidDate)
        throw new BadRequestException('The date must be in the future');
    }

    // If a new thumbnail is provided, we upload the new image and delete the previous one
    if (file) {
      const [upload] = await Promise.all([
        this.cloudinaryService.uploadFile(file, 'events'),
        this.cloudinaryService.deleteFiles([currentEvent.public_id]),
      ]);

      // Add the new image info to the imageInfo
      imageInfo.thumbnail = upload.secure_url;
      imageInfo.public_id = upload.public_id;
    }

    const updatedEvent = await this.prismaService.event.update({
      where: {
        id,
      },
      data: {
        ...data,
        ...imageInfo,
      },
    });

    return {
      statusCode: HttpStatus.OK,
      data: updatedEvent,
      message: 'Event updated successfully',
    };
  }

  async updateStatus(
    id: string,
    data: UpdateEventStatusDto,
  ): Promise<ApiResponse> {
    // Check if the event exists
    await this.findOne(id);

    const updatedEvent = await this.prismaService.event.update({
      where: {
        id,
      },
      data,
    });

    return {
      statusCode: HttpStatus.OK,
      data: updatedEvent,
      message: 'Event status updated successfully',
    };
  }

  async delete(id: string): Promise<ApiResponse> {
    // Check if the event exists
    const event = await this.findOne(id);
    const data = event.data as Event;

    await Promise.all([
      this.cloudinaryService.deleteFiles([data.public_id]),
      this.prismaService.event.delete({
        where: {
          id,
        },
      }),
    ]);

    return {
      statusCode: HttpStatus.OK,
      message: 'Event deleted successfully',
      data: null,
    };
  }

  async addImages(
    id: string,
    images: Array<Express.Multer.File>,
  ): Promise<ApiResponse> {
    const { data } = await this.findOne(id);
    const event = data as Event;

    if (!event.completed)
      throw new BadRequestException('Event is not completed');

    const uploads = await this.cloudinaryService.uploadFiles(
      images,
      'events/images',
    );

    const eventImages = await this.prismaService.eventImage.createMany({
      data: uploads.map((image) => ({
        eventId: id,
        url: image.secure_url,
        public_id: image.public_id,
        width: image.width,
        height: image.height,
      })),
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: `${eventImages.count} ${
        eventImages.count === 1 ? 'image' : 'images'
      } added successfully`,
      data: null,
    };
  }

  async deleteImage(imageId: string): Promise<ApiResponse> {
    // Check if the image exists
    const image = await this.prismaService.eventImage.findUnique({
      where: {
        id: imageId,
      },
    });

    if (!image) throw new BadRequestException('Image not found');

    await Promise.all([
      this.cloudinaryService.deleteFiles([image.public_id]),
      this.prismaService.eventImage.delete({
        where: {
          id: imageId,
        },
      }),
    ]);

    return {
      statusCode: HttpStatus.OK,
      message: 'Image deleted successfully',
      data: null,
    };
  }

  async deleteAllImages(eventId: string): Promise<ApiResponse> {
    // Check if the event exists
    await this.findOne(eventId);

    const images = await this.prismaService.eventImage.findMany({
      where: {
        eventId,
      },
      select: {
        public_id: true,
      },
    });

    const publicIds = images.map((image) => image.public_id);

    await Promise.all([
      this.cloudinaryService.deleteFiles(publicIds),
      this.prismaService.eventImage.deleteMany({
        where: {
          eventId,
        },
      }),
    ]);

    return {
      statusCode: HttpStatus.OK,
      message: 'All images deleted successfully',
      data: null,
    };
  }

  //--------------------------------
  //  Auxiliar service methods
  //--------------------------------
  private groupByMonth(events: Event[]): Record<string, Event[]> {
    return events.reduce((acc, event) => {
      const month = dayjs(event.datetime).format('MMMM').toLowerCase();

      if (!acc[month]) {
        acc[month] = [];
      }

      acc[month].push(event);

      return acc;
    }, {});
  }
}
