import { Pipe, PipeTransform } from '@angular/core';
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";

@Pipe({
  name: 'safeClickableLinks'
})
export class SafeClickableLinksPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string | null | undefined): string | null {
    value = value ?? '';
    const sanitizedText = this.sanitizer.sanitize(1, value) ?? '';
    return this.linkify(sanitizedText);
  }

  linkify(text: string): string {
    // regex from here https://stackoverflow.com/a/3809435/5589918
    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/ig;
    return text.replace(urlRegex, function(url) {
      return '<a target="_blank" href="' + url + '">' + url + '</a>';
    });
  }
}
