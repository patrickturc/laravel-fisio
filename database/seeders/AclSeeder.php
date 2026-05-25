<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use App\Models\User;

class AclSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Permissions List
        $permissions = [
            // Dashboard
            'dashboard.view',
            
            // Patients
            'patients.manage.view',
            'patients.manage.create',
            'patients.manage.edit',
            'patients.manage.delete',

            // Appointments
            'appointments.manage.view',
            'appointments.manage.create',
            'appointments.manage.edit',
            'appointments.manage.delete',

            // Evolutions
            'evolutions.manage.view',
            'evolutions.manage.create',
            'evolutions.manage.edit',
            'evolutions.manage.delete',

            // Treatment Plans
            'treatment_plans.manage.view',
            'treatment_plans.manage.create',
            'treatment_plans.manage.edit',
            'treatment_plans.manage.delete',

            // Memberships
            'memberships.manage.view',
            'memberships.manage.create',
            'memberships.manage.edit',
            'memberships.manage.delete',

            // Financial
            'financial.transactions.view',
            'financial.transactions.create',
            'financial.transactions.edit',
            'financial.transactions.delete',

            // Reports
            'reports.manage.view',

            // Settings
            'settings.users.view',
            'settings.users.create',
            'settings.users.edit',
            'settings.users.delete',
            'settings.roles.view',
            'settings.roles.create',
            'settings.roles.edit',
            'settings.roles.delete',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        // Create Roles and assign created permissions
        $roleAdmin = Role::findOrCreate('Administrador', 'web');
        $roleAdmin->givePermissionTo(Permission::all());

        $roleReceptionist = Role::findOrCreate('Recepcionista', 'web');
        $roleReceptionist->givePermissionTo([
            'dashboard.view',
            'patients.manage.view',
            'patients.manage.create',
            'patients.manage.edit',
            'appointments.manage.view',
            'appointments.manage.create',
            'appointments.manage.edit',
            'memberships.manage.view',
            'financial.transactions.view',
            'financial.transactions.create', // Can receive payments
        ]);

        $rolePhysio = Role::findOrCreate('Fisioterapeuta', 'web');
        $rolePhysio->givePermissionTo([
            'dashboard.view',
            'patients.manage.view',
            'appointments.manage.view',
            'evolutions.manage.view',
            'evolutions.manage.create',
            'evolutions.manage.edit',
            'treatment_plans.manage.view',
            'treatment_plans.manage.create',
            'treatment_plans.manage.edit',
        ]);

        // Assign 'Administrador' role to the admin user
        $user = User::where('email', 'paturchette@gmail.com')->first();
        if ($user) {
            $user->assignRole($roleAdmin);
        }
    }
}
