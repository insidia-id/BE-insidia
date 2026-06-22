import { Injectable } from '@nestjs/common';

export type BulkUserTemplateRole = 'GURU' | 'MURID' | 'WALI_MURID' | 'AKADEMIK';

interface TemplateColumn {
  header: string;
  example: string;
}

@Injectable()
export class BulkUserTemplateGeneratorService {
  private readonly baseColumns: TemplateColumn[] = [
    { header: 'email', example: 'user@example.com' },
    { header: 'name', example: 'John Doe' },
    { header: 'phone', example: '081234567890' },
    { header: 'status', example: 'ACTIVE' },
  ];

  private readonly roleSpecificColumns: Record<
    BulkUserTemplateRole,
    TemplateColumn[]
  > = {
    GURU: [
      { header: 'nip', example: '198001012000011001' },
      { header: 'subject', example: 'Matematika' },
    ],
    MURID: [
      { header: 'nis', example: '2024001' },
      { header: 'kelas', example: '12 IPA 1' },
      { header: 'jurusan', example: 'IPA' },
    ],
    WALI_MURID: [
      { header: 'pekerjaan', example: 'Pegawai Swasta' },
      { header: 'alamat', example: 'Jl. Contoh No. 123' },
    ],
    AKADEMIK: [
      { header: 'position', example: 'Kepala Sekolah' },
      { header: 'division', example: 'Administrasi' },
    ],
  };

  generateTemplate(roleCode: BulkUserTemplateRole): string {
    const columns = [
      ...this.baseColumns,
      ...(this.roleSpecificColumns[roleCode] || []),
    ];

    const headers = columns.map((col) => col.header).join(',');
    const examples = columns.map((col) => col.example).join(',');

    return `${headers}\n${examples}\n`;
  }

  getTemplateFilename(roleCode: BulkUserTemplateRole): string {
    const roleNames: Record<BulkUserTemplateRole, string> = {
      GURU: 'guru',
      MURID: 'murid',
      WALI_MURID: 'wali-murid',
      AKADEMIK: 'akademik',
    };

    const timestamp = new Date().toISOString().split('T')[0];
    return `bulk-upload-template-${roleNames[roleCode]}-${timestamp}.csv`;
  }

  isValidRoleCode(roleCode: string): roleCode is BulkUserTemplateRole {
    return ['GURU', 'MURID', 'WALI_MURID', 'AKADEMIK'].includes(roleCode);
  }
}
