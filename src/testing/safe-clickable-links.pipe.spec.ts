import { SafeClickableLinksPipe } from '../app/Utils/safe-clickable-links.pipe';
import {TestBed} from "@angular/core/testing";
import {DomSanitizer} from "@angular/platform-browser";

describe('SafeHtmlPipe', () => {

  let pipe: SafeClickableLinksPipe;
  let sanitizer: DomSanitizer;

  beforeEach(() => {
    sanitizer = TestBed.inject(DomSanitizer);
    pipe = new SafeClickableLinksPipe(sanitizer);
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should linkify text', () => {
    const input = 'Here is a nice link https://www.google.com/';
    const output = pipe.transform(input);
    expect(output).toContain('<a');
  });

  it('should sanitize text', () => {
    const input = "<p>Hello, world!</p><script>alert(\"XSS attack!\");</script>";
    const output = pipe.transform(input);
    expect(output).not.toContain('<script>');
  })
});
