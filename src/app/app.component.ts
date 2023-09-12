import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PluginService } from './PluginService/plugin-service.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})

export class AppComponent {
  constructor(private router: Router, private service: PluginService) { 
  }
 
}