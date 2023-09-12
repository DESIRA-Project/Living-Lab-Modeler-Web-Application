export class Deepcopy {

  // From: https://stackoverflow.com/a/28152032/5589918
  public static object(o: any): any {
    return Object.assign({}, o);
  }

  // From: https://stackoverflow.com/a/23481096/5589918
  public static copy(o: any): any {
    return JSON.parse(JSON.stringify(o))
  }

}
