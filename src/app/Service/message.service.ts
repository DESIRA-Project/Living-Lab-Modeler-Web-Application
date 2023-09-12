import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  messageQueue: string[] = [];

  constructor() { }

  push(message: string): void {
    this.messageQueue.push(message);
  }

  pop(): string | undefined {
    return this.messageQueue.pop();
  }

  clear(): void {
    this.messageQueue = [];
  }
}
