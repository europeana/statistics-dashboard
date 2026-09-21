import { Pipe, PipeTransform } from '@angular/core';

export function createMockPipe(name: string): new () => PipeTransform {
  class MockPipe implements PipeTransform {
    transform(...args: unknown[]): string {
      return `${name}(${args.join(',')})`;
    }
  }

  (MockPipe as unknown as Record<string, unknown>).__annotations__ = [
    new Pipe({ name, standalone: true })
  ];

  return MockPipe;
}
