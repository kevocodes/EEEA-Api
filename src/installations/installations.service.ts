import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import {
  CreateInstallationDto,
  UpdateInstallationDto,
} from './dtos/installations.dto';
import { ApiResponse } from 'src/common/types/response.type';
import { CloudinaryService } from 'src/config/cloudinary/cloudinary.service';
import { Installation } from '@prisma/client';
import { InstallationImageInfo } from './types/installation.types';

@Injectable()
export class InstallationsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
    image: Express.Multer.File,
    data: CreateInstallationDto,
  ): Promise<ApiResponse> {
    const upload = await this.cloudinaryService.uploadFile(
      image,
      'installations',
    );

    const installation = await this.prismaService.installation.create({
      data: {
        name: data.name,
        public_id: upload.public_id,
        url: upload.secure_url,
        width: upload.width,
        height: upload.height,
      },
    });

    return {
      statusCode: 201,
      data: installation,
      message: 'Installation created successfully',
    };
  }

  async findAll(): Promise<ApiResponse> {
    const installations = await this.prismaService.installation.findMany();

    return {
      statusCode: 200,
      message: 'Installations retrieved successfully',
      data: installations,
    };
  }

  async findOne(id: string): Promise<ApiResponse> {
    const installation = await this.prismaService.installation.findUnique({
      where: {
        id,
      },
    });

    if (!installation) throw new NotFoundException('Installation not found');

    return {
      statusCode: 200,
      message: 'Installation retrieved successfully',
      data: installation,
    };
  }

  async update(
    id: string,
    data: UpdateInstallationDto,
    image: Express.Multer.File,
  ): Promise<ApiResponse> {
    // Check if the installation exists
    const result = await this.findOne(id);

    const currentInstallation: Installation = result.data;
    const imageInfo: InstallationImageInfo = {};

    // If a new image is provided, upload the new image and delete the previous one
    if (image) {
      const [upload] = await Promise.all([
        this.cloudinaryService.uploadFile(image, 'installations'),
        this.cloudinaryService.deleteFiles([currentInstallation.public_id]),
      ]);

      // Assign the new image info to the imageInfo
      imageInfo.url = upload.secure_url;
      imageInfo.public_id = upload.public_id;
    }

    const updatedInstallation = await this.prismaService.installation.update({
      where: {
        id,
      },
      data: {
        ...data,
        ...imageInfo,
      },
    });

    return {
      statusCode: 200,
      message: 'Installation updated successfully',
      data: updatedInstallation,
    };
  }

  async delete(id: string): Promise<ApiResponse> {
    // Check if the installation exists
    const installation = await this.findOne(id);
    const data = installation.data as Installation;

    // Delete the installation and its image in parallel
    await Promise.all([
      this.cloudinaryService.deleteFiles([data.public_id]),
      this.prismaService.installation.delete({
        where: {
          id,
        },
      }),
    ]);

    return {
      statusCode: 200,
      message: 'Installation deleted successfully',
      data: null,
    };
  }

  async deleteAll(): Promise<ApiResponse> {
    // Delete all installations
    const installations = await this.prismaService.installation.findMany();

    // Get all public_ids
    const publicIds = installations.map(
      (installation) => installation.public_id,
    );

    // Delete all images in parallel
    await Promise.all([
      this.cloudinaryService.deleteFiles(publicIds),
      this.prismaService.installation.deleteMany(),
    ]);

    return {
      statusCode: 200,
      message: 'All installations deleted successfully',
      data: null,
    };
  }
}
