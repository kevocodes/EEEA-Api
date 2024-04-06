import {
  HttpStatus,
  ParseFilePipe,
  ParseFilePipeBuilder,
} from '@nestjs/common';
import { megBytesToBytes } from './bytes-to-mb';

interface ParseImagePipeOptions {
  required?: boolean;
}

export function getParseImagePipe({
  required = true,
}: ParseImagePipeOptions = {}): ParseFilePipe {
  return new ParseFilePipeBuilder()
    .addFileTypeValidator({
      fileType: '.(png|jpeg|jpg|webp)',
    })
    .addMaxSizeValidator({
      maxSize: megBytesToBytes(1.5),
      message: 'File size must be less than 1.5 MB',
    })
    .build({
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      fileIsRequired: required,
    });
}
