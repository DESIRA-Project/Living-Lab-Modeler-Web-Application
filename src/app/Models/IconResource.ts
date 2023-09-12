import { AssetsService } from "../Service/assets.service";
import {Response} from "./Response/response";

export interface IconResource{
     iconUrl:string,
     originalIconName?:string,
};

export class IconResourceListComponent{

    constructor(protected assetsService: AssetsService, private numIconsPerRow:number){

    }

    protected recalculateImages(t: IconResource[][]): IconResource[][] {
        for (let i = 0; i < t.length; i++) {
          for (let j = 0; j < t[i].length; j++) {
            if(t[i][j].iconUrl === undefined){
              t[i][j].iconUrl = 'undefined';
            }
            else{
                 t[i][j].iconUrl = this.assetsService.getAssetLink(t[i][j].iconUrl, true);
            }
          }
        }
        return t;
    }

  /*
    Create and return a 2d array e.g. for icon.length = 8 and numIconsPerRow = 4
    [
      [icon1, icon2, icon3, icon4],
      [icon5, icon6, icon7, icon8]
    ]
   */
    protected setupIconResourcesPerRow(icons: IconResource[]): IconResource[][] {
        let i = 0;
        const iconsPerRow: IconResource[][] = [];
        for (const icon of icons) {
          if (i === 0) {
            i = this.numIconsPerRow;
            iconsPerRow.push([]);
          }

          iconsPerRow[iconsPerRow.length - 1].push(icon);
          i--;
        }
        return iconsPerRow;
      }
};
