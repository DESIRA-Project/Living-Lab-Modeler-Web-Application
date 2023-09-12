import { BreakpointObserver } from "@angular/cdk/layout";
import { Component, EventEmitter, ViewChild } from "@angular/core";
import { BreadcrumbController } from "../Breadcrumb/breadcrumb-controller";
import { BreadcrumbComponent } from "../Breadcrumb/breadcrumb.component";
import { ContactEnvelope } from "../Models/ContactEnvelope";
import { AngularServicesProviderService } from "../Service/angular-services-provider.service";
import { ContactService } from "../Service/contact.service";
import { ErrorResponse } from '../Models/Response/error-response';
import { Response } from 'src/app/Models/Response/response';
import { ReCaptchaService } from "../ReCaptchaService/recaptcha.service";
import { environment } from "src/environments/environment";
import { CardRenderableComponent } from "../CardRenderableComponent/card-renderable.component";

@Component({
    selector: 'contact',
    templateUrl: './contact.component.html',
    styleUrls: ['./contact.component.css', '../CardRenderableComponent/card-renderable.component.css']
})
export class ContactComponent extends CardRenderableComponent implements BreadcrumbController {
    private breadcrumb: BreadcrumbComponent | null = null;
    title = "Contact";
    visitorName = "";
    visitorEmail = "";
    visitorSubject = "";
    visitorMessage = "";
    ready: boolean = true;
    public recaptchaClicked = false;
    public usesRecaptcha = environment.env.backend.use_recaptcha;

    constructor(private contactService: ContactService, private angularService: AngularServicesProviderService, private recaptchaService: ReCaptchaService,public breakpointObserver: BreakpointObserver) {
        super(breakpointObserver,"500px",false);
    }

    keepParentUptoDate(e: any) {

    }

    clearContent() {
        this.visitorName = this.visitorEmail = this.visitorSubject = this.visitorMessage = '';
    }

    hasContent(): boolean {
        return this.visitorEmail.trim() !== '' || this.visitorSubject.trim() !== '' || this.visitorName.trim() !== '' || this.visitorMessage.trim() !== '';
    }

    canSubmit(): boolean {
        if (this.visitorEmail.trim() === '' || this.visitorSubject.trim() === '') return false;
        return true;
    }

    setBreadcrumb(inst: BreadcrumbComponent): void {
        if (inst !== null) {
            this.breadcrumb = inst;
            this.breadcrumb.setLabel("contact");
        }
    }

    setLabel(label: string): void {
        if (this.breadcrumb !== null) {
            this.breadcrumb.setLabel(label);
        }
    }

    setPath(path: any[] | undefined): void {
        if (this.breadcrumb !== null) {
            if (path === undefined) {
                this.breadcrumb.setPath(null);
            }
            else {
                this.breadcrumb.setPath(path);
            }
        }
    }

    clearVisitorName() {
        this.visitorName = "";
    }

    clearVisitorEmail() {
        this.visitorEmail = "";
    }

    clearVisitorSubject() {
        this.visitorSubject = "";
    }

    clearVisitorMessage() {
        this.visitorMessage = "";
    }

    submitContent() {
        let content: ContactEnvelope = {
            name: this.visitorName,
            email: this.visitorEmail,
            subject: this.visitorSubject,
            message: this.visitorMessage
        } as ContactEnvelope;

        let inst = this;
        inst.ready = false;
        this.contactService.submitFeedback(content).subscribe(
            (data: Response<boolean>) => {
                inst.angularService.createNewModal().alert(true, 'Your message has been submitted successfully.');
                //window.location.reload();
                inst.visitorMessage = "";
                inst.visitorSubject = "";
                inst.ready = true;

                setTimeout(()=>{
                    inst.reinitRecaptcha();
                },1000);

       

            },
            (error: ErrorResponse) => {
                inst.angularService.createNewModal().alert(false, "Your message could not be delivered.");
                inst.ready = true;
            });
    }

    reinitRecaptcha(){
        let inst = this;
        inst.recaptchaService.reset((v: any) => {
            inst.recaptchaClicked = true;
        })
    }

    ngOnInit() {
        let inst = this;
        if (!inst.usesRecaptcha) return;

        inst.recaptchaService.isInitialized().subscribe(rcInit => {
            if (rcInit !== true) {
                return;
            }
            inst.recaptchaService.injectPluginScript();
            inst.recaptchaService.isInjected().subscribe((val: any) => {
                if (val === true) {
                    inst.recaptchaService.execute((v: any) => {
                        inst.recaptchaClicked = true;
                    });
                }
            });
        });

    }


}