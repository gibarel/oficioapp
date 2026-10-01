<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class BackupDatabase extends Command
{
    /**
     * El nombre y la firma del comando por consola.
     */
    protected $signature = 'db:backup-sqlite';

    /**
     * La descripción del comando.
     */
    protected $signature_description = 'Crea un respaldo comprimido de la base de datos SQLite y limpia copias antiguas.';

    public function handle()
    {
        $dbPath = database_path('database.sqlite');

        if (!File::exists($dbPath)) {
            $this->error("No se encontró el archivo de base de datos en: {$dbPath}");
            return Command::FAILURE;
        }

        // Definir directorio y nombre del archivo de respaldo
        $backupDir = storage_path('app/backups/sqlite');
        File::ensureDirectoryExists($backupDir);

        $timestamp = now()->format('Y-m-d_H-i-s');
        $backupFileName = "database_backup_{$timestamp}.sqlite";
        $backupPath = "{$backupDir}/{$backupFileName}";

        // 1. Copia de seguridad del archivo SQLite
        if (File::copy($dbPath, $backupPath)) {
            $this->info("✓ Copia de respaldo creada en: {$backupPath}");

            // 2. Comprimir el archivo para ahorrar espacio (opcional)
            $gzPath = "{$backupPath}.gz";
            $fp = gzopen($gzPath, 'w9');
            gzwrite($fp, file_get_contents($backupPath));
            gzclose($fp);

            // Eliminar el archivo .sqlite sin comprimir
            File::delete($backupPath);
            $this->info("✓ Archivo comprimido correctamente: {$gzPath}");

            // 3. Rotación de archivos: conservar solo los respaldos de los últimos 7 días
            $this->cleanOldBackups($backupDir, 7);

            return Command::SUCCESS;
        }

        $this->error("Error al intentar realizar la copia de respaldo.");
        return Command::FAILURE;
    }

    /**
     * Elimina los archivos de respaldo más antiguos a $daysOld días.
     */
    protected function cleanOldBackups(string $dir, int $daysOld)
    {
        $files = File::files($dir);
        $expirationTime = now()->subDays($daysOld)->timestamp;

        foreach ($files as $file) {
            if ($file->getMTime() < $expirationTime) {
                File::delete($file->getPathname());
                $this->line("<comment>Se eliminó respaldo antiguo:</comment> {$file->getFilename()}");
            }
        }
    }
}