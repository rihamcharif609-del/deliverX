<?php

namespace App\Enums;

enum AnnouncementType: string
{
    case Info = 'info';
    case Warning = 'warning';
    case Important = 'important';
    case Maintenance = 'maintenance';

    public function label(): string
    {
        return match ($this) {
            self::Info => 'Info',
            self::Warning => 'Warning',
            self::Important => 'Important',
            self::Maintenance => 'Maintenance',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public static function tryFromCaseInsensitive(string $value): ?self
    {
        $normalized = strtolower(trim($value));

        return match ($normalized) {
            'info' => self::Info,
            'warning' => self::Warning,
            'important' => self::Important,
            'maintenance' => self::Maintenance,
            default => null,
        };
    }
}
