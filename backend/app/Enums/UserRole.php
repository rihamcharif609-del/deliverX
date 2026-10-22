<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case Sender = 'sender';
    case Courier = 'courier';

    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Administrator',
            self::Sender => 'Sender',
            self::Courier => 'Courier',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
