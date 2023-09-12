import { DebugElement } from "@angular/core";
import { ComponentFixture, tick } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { LLCreationComponent } from "src/app/User/LLCreation/ll-creation.component";

export class TestUtils {
    public static cleanAndCollectInputValue<T>(e: DebugElement, fixture: ComponentFixture<T>, elms: { debugElement: DebugElement, initialValue: string }[])
        : { debugElement: DebugElement, initialValue: string }[] {
        let formField = e.queryAll(By.css('textarea[name="title"]'));
        if (formField.length === 0) {
            formField = e.queryAll(By.css('input[name="title"]'));
        }
        if (formField.length === 0) {
            formField = e.queryAll(By.css('input'));
        }
        expect(formField.length).toEqual(1);

        let el = formField[0];

        let initialStringValue = el.nativeElement.value;
        elms.push({ debugElement: el, initialValue: initialStringValue });

        el.nativeElement.value = "";
        el.nativeElement.dispatchEvent(new Event('input'));
        tick(2000);

        fixture.detectChanges();
        fixture.whenStable();
        return elms;
    };

    public static addStringToInput<T>(e: DebugElement, s: string, fixture: ComponentFixture<T>): void {
        let elms: { debugElement: DebugElement, initialValue: string }[] = [];

        elms = TestUtils.cleanAndCollectInputValue(e, fixture, elms);
        for (let i = 0; i < elms.length; i++) {
            let elm = elms[i];
            for (let j = 0; j < s.length; j++) {
                elm.debugElement.nativeElement.value += s[j];
                elm.debugElement.nativeElement.dispatchEvent(new Event('input'));
                tick(2000);

                fixture.detectChanges();
                fixture.whenStable();
            }
        }
        return;
    };

    public static setGeneralInfoValuesAndCollectInitialOnes<T>(e: DebugElement, s: string, fixture: ComponentFixture<T>, elms: { debugElement: DebugElement, initialValue: string }[])
        : { debugElement: DebugElement, initialValue: string }[] {

        elms = TestUtils.cleanAndCollectInputValue(e, fixture, elms);
        for (let i = 0; i < elms.length; i++) {
            let elm = elms[i];
            for (let j = 0; j < s.length; j++) {
                elm.debugElement.nativeElement.value += s[j];
                elm.debugElement.nativeElement.dispatchEvent(new Event('input'));
                tick(2000);

                fixture.detectChanges();
                fixture.whenStable();
            }
        }
        return elms;
    };

    public static setGeneralInfoValues<T>(fixture: ComponentFixture<T>, elms: { debugElement: DebugElement, initialValue: string }[], cb: Function): { debugElement: DebugElement, initialValue: string }[] {

        for (let i = 0; i < elms.length; i++) {
            let elm = elms[i];
            elm.debugElement.nativeElement.value = elm.initialValue;
            elm.debugElement.nativeElement.dispatchEvent(new Event('input'));
            tick(2000);

            fixture.detectChanges();
            fixture.whenStable().then(() => {
                if (cb) {
                    cb(i, elms.length - 2);
                }

            });

        }
        return elms;
    };

    public static logUpdateComponentInfo(component: LLCreationComponent): void {
        console.log("Is Ready?" + component.ready);
        console.log("Current view = " + component.currentView);
        console.log("Current ComponentName " + component.currentComponentName);
        console.log("Data Fetched = " + component.dataFetched);
    };


    public static goToTab<T>(fixture: ComponentFixture<T>, tabNo: number, tabSelector = '.tab-title', tickInterval = 200): void {
        const tabsDe = fixture.debugElement.queryAll(By.css(tabSelector));
        if (tabNo < 0 || tabNo > tabsDe.length) return;
        const tabEl = tabsDe[tabNo].nativeElement;
        tabEl.click();

        tick(tickInterval);
        fixture.detectChanges();
        tick(tickInterval);
        fixture.detectChanges();
        tick(tickInterval);
        fixture.detectChanges();
    }

    public static loadMaterialIcons(){
        const materialIcons = document.createElement('link');
        materialIcons.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
        materialIcons.rel = 'stylesheet';
        document.head.appendChild(materialIcons);
    }

    public static clickElement<T>(fixture: ComponentFixture<T>, selector:string): DebugElement{
        let isPublic = fixture.debugElement.query(By.css(selector));
        expect(isPublic).toBeTruthy();
       isPublic.nativeElement.click();

/*    tick(200);
    fixture.detectChanges();*/
    return isPublic;
    }

}
