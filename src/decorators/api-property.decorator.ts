/**
 * MIT License
 * Copyright (c) 2017-2020 Kamil Mysliwiec
 * @licence https://opensource.org/licenses/MIT
 * @source https://github.com/nestjs/swagger/tree/4.5.5
 */
import { DECORATORS } from '../constants';
import { SchemaObjectMetadata } from '../interfaces/schema-object-metadata.interface';
import { getEnumType, getEnumValues } from '../utils/enum.utils';
import { createPropertyDecorator, getTypeIsArrayTuple } from './helpers';

export interface ApiPropertyOptions extends Omit<SchemaObjectMetadata, 'name' | 'enum'> {
    name?: string;
    enum?: any[] | Record<string, any>;
    enumName?: string;
}

const isEnumArray = (obj: ApiPropertyOptions): boolean => obj.isArray && !!obj.enum;

export function ApiProperty(options: ApiPropertyOptions = {}): PropertyDecorator {
    return createApiPropertyDecorator(options);
}

export function createApiPropertyDecorator(
    options: ApiPropertyOptions = {},
    overrideExisting = true
): PropertyDecorator {
    const [type, isArray] = getTypeIsArrayTuple(options.type, options.isArray);
    options = {
        ...options,
        type,
        isArray,
    };

    if (isEnumArray(options)) {
        options.type = 'array';

        const enumValues = getEnumValues(options.enum);
        options.items = {
            type: getEnumType(enumValues),
            enum: enumValues,
        };
        delete options.enum;
    } else if (options.enum) {
        const enumValues = getEnumValues(options.enum);

        options.enum = enumValues;
        options.type = getEnumType(enumValues);
    }

    return createPropertyDecorator(DECORATORS.API_MODEL_PROPERTIES, options, overrideExisting);
}

export function ApiPropertyOptional(options: ApiPropertyOptions = {}): PropertyDecorator {
    return ApiProperty({
        ...options,
        required: false,
    });
}

export function ApiResponseProperty(
    options: Pick<ApiPropertyOptions, 'type' | 'example' | 'format' | 'enum' | 'deprecated'> = {}
): PropertyDecorator {
    return ApiProperty({
        readOnly: true,
        ...options,
    });
}
