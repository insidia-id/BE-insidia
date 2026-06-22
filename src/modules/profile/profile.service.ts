import { Injectable } from '@nestjs/common';
import { ProfileRepository } from './profile.repository';
@Injectable()
export class ProfileService {
  constructor(private readonly profileRepository: ProfileRepository) {}

  createProfileByRole(userMitraRoleId: string, role: string, dto: any) {
    if (role === 'MURID') {
      return this.profileRepository.createMuridProfile(userMitraRoleId, dto);
    } else if (role === 'GURU') {
      return this.profileRepository.createGuruProfile(userMitraRoleId, dto);
    }
  }
}
