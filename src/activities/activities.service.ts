import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import {
  CreateActivityDto,
  UpdateActivityDto,
  FindAllActivitiesDto,
} from './dtos/acitivities.dto';
import { ApiResponse } from 'src/common/types/response.type';
import * as dayjs from 'dayjs';
import { Activity, Prisma } from '@prisma/client';

@Injectable()
export class ActivitiesService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    data: CreateActivityDto,
    creatorId: string,
  ): Promise<ApiResponse> {
    const isInvalidDate = dayjs(data.datetime).isBefore(dayjs());

    if (isInvalidDate)
      throw new BadRequestException('The date must be in the future');

    const activity = await this.prismaService.activity.create({
      data: {
        title: data.title,
        datetime: data.datetime,
        creatorId,
      },
    });

    return {
      statusCode: HttpStatus.CREATED,
      data: activity,
      message: 'Activity created successfully',
    };
  }

  async findAll(query: FindAllActivitiesDto): Promise<ApiResponse> {
    const {
      year = dayjs().year(),
      startMonth,
      endMonth,
      groupedByMonth,
    } = query;

    const whereOptions: Prisma.ActivityWhereInput = {};

    /*-----------------------------
      Date range query validation
      ----------------------------- */
    const monthRangeProvided = startMonth && endMonth;
    const isValidMonthRange = endMonth >= startMonth;
    const isSameMonth = startMonth === endMonth;

    if (monthRangeProvided && !isValidMonthRange)
      throw new BadRequestException('Invalid month range');

    // By default, we get all activities for the year
    let startOfYear = dayjs().year(year).startOf('year');
    let endOfYear = dayjs().year(year).endOf('year');

    // If startMonth and endMonth query params are provided, we filter the activities using the month range
    if (monthRangeProvided) {
      startOfYear = startOfYear.month(startMonth - 1).startOf('month');
      endOfYear = endOfYear.month(endMonth - 1).endOf('month');
    }

    // Add the datetime range to the prisma whereOptions
    whereOptions.datetime = {
      gte: startOfYear.toDate(),
      lte: endOfYear.toDate(),
    };

    const activities = await this.prismaService.activity.findMany({
      where: whereOptions,
      orderBy: {
        datetime: 'asc',
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
        events: isGroupByMonth ? this.groupByMonth(activities) : activities,
      },
      message: 'Events retrieved successfully',
    };
  }

  async findAllByMonth(month: number): Promise<ApiResponse> {
    const startOfMonth = dayjs()
      .month(month - 1)
      .startOf('month');
    const endOfMonth = dayjs()
      .month(month - 1)
      .endOf('month');

    const activities = await this.prismaService.activity.findMany({
      where: {
        datetime: {
          gte: startOfMonth.toDate(),
          lte: endOfMonth.toDate(),
        },
      },
    });

    return {
      statusCode: HttpStatus.OK,
      data: activities,
      message: 'Activities retrieved successfully',
    };
  }

  async findOne(id: string): Promise<ApiResponse> {
    const activity = await this.prismaService.activity.findUnique({
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
      },
    });

    if (!activity) throw new BadRequestException('Activity not found');

    return {
      statusCode: HttpStatus.OK,
      data: activity,
      message: 'Activity retrieved successfully',
    };
  }

  async update(id: string, data: UpdateActivityDto): Promise<ApiResponse> {
    // Check if the activity exists
    await this.findOne(id);

    if (data.datetime) {
      const isInvalidDate = dayjs(data.datetime).isBefore(dayjs());

      if (isInvalidDate)
        throw new BadRequestException('The date must be in the future');
    }

    const activity = await this.prismaService.activity.update({
      where: {
        id,
      },
      data,
    });

    return {
      statusCode: HttpStatus.OK,
      data: activity,
      message: 'Event updated successfully',
    };
  }

  async delete(id: string): Promise<ApiResponse> {
    // Check if the activity exists
    await this.findOne(id);

    await this.prismaService.activity.delete({
      where: {
        id,
      },
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Activity deleted successfully',
      data: null,
    };
  }

  //--------------------------------
  //  Auxiliar service methods
  //--------------------------------
  private groupByMonth(activities: Activity[]): Record<string, Activity[]> {
    return activities.reduce((acc, activity) => {
      const month = dayjs(activity.datetime).format('MMMM');

      if (!acc[month]) {
        acc[month] = [];
      }

      acc[month].push(activity);

      return acc;
    }, {});
  }
}
