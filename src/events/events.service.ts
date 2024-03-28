import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { Event, Prisma } from '@prisma/client';
import { PrismaService } from 'src/config/prisma/prisma.service';
import {
  CreateEventDto,
  UpdateEventDto,
  findAllEventsDto,
} from './dtos/events.dto';
import { ApiResponse } from 'src/common/types/response.type';

import * as dayjs from 'dayjs';

@Injectable()
export class EventsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: CreateEventDto, creatorId: string): Promise<ApiResponse> {
    const isInvalidDate = dayjs(data.datetime).isBefore(dayjs());

    if (isInvalidDate)
      throw new BadRequestException('The date must be in the future');

    const event = await this.prismaService.event.create({
      data: {
        title: data.title,
        datetime: data.datetime,
        location: data.location,
        thumbnail: data.thumbnail,
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
        datetime: 'asc',
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
        events: isGroupByMonth ? this.groupByMonth(events) : events,
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
          },
        },
      },
    });

    if (!event) throw new BadRequestException('Event not found');

    return {
      statusCode: HttpStatus.OK,
      data: event,
      message: 'Event retrieved successfully',
    };
  }

  async update(id: string, data: UpdateEventDto): Promise<ApiResponse> {
    // Check if the event exists
    await this.findOne(id);

    if (data.datetime) {
      const isInvalidDate = dayjs(data.datetime).isBefore(dayjs());

      if (isInvalidDate)
        throw new BadRequestException('The date must be in the future');
    }

    const event = await this.prismaService.event.update({
      where: {
        id,
      },
      data: {
        ...data,
      },
    });

    return {
      statusCode: HttpStatus.OK,
      data: event,
      message: 'Event updated successfully',
    };
  }

  async delete(id: string): Promise<ApiResponse> {
    // Check if the event exists
    await this.findOne(id);

    await this.prismaService.event.delete({
      where: {
        id,
      },
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Event deleted successfully',
      data: null,
    };
  }

  async addImages(id: string, images: string[]): Promise<ApiResponse> {
    const { data } = await this.findOne(id);
    const event = data as Event;

    if (!event.completed)
      throw new BadRequestException('Event is not completed');

    const eventImages = await this.prismaService.eventImage.createMany({
      data: images.map((image) => ({
        eventId: id,
        url: image,
      })),
    });

    return {
      statusCode: HttpStatus.CREATED,
      data: eventImages,
      message: 'Images added successfully',
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

    await this.prismaService.eventImage.delete({
      where: {
        id: imageId,
      },
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Image deleted successfully',
      data: null,
    };
  }

  //--------------------------------
  //  Auxiliar service methods
  //--------------------------------
  private groupByMonth(events: Event[]): Record<string, Event[]> {
    return events.reduce((acc, event) => {
      const month = dayjs(event.datetime).format('MMMM');

      if (!acc[month]) {
        acc[month] = [];
      }

      acc[month].push(event);

      return acc;
    }, {});
  }
}
