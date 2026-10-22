<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class ReactivateExpiredSuspensions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'users:reactivate-suspended';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically reactivate user accounts whose temporary suspension duration has expired';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $count = User::where('status', 'suspended')
            ->whereNotNull('suspended_until')
            ->where('suspended_until', '<=', now())
            ->update([
                'status' => 'active',
                'suspended_at' => null,
                'suspended_until' => null,
                'suspension_reason' => null,
            ]);

        $this->info("Reactivated {$count} expired user suspension(s).");

        return self::SUCCESS;
    }
}
