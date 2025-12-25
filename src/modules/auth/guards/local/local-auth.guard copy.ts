import { Reflector } from '@nestjs/core';

import { LocalAuthGuard } from './local-auth.guard';

describe('LocalAuthGuard', () => {
  it('should be defined', () => {
    const reflector = new Reflector();
    expect(new LocalAuthGuard(reflector)).toBeDefined();
  });
});
