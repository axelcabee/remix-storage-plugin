import { toast } from "react-toastify";
import { BehaviorSubject } from "rxjs";
import {
  ipfservice,
  loaderservice,
  localipfsstorage,
} from "../../App";

export interface boxObject {
  key?: string;
  cid?: string;
  datestored?: string | number | Date;
  datecommit?: number | string | Date;
  timestamp: number;
  ref?: string;
  message?: string;
  links?: string;
}
export class BoxService {
  status = new BehaviorSubject<boolean>(false);
  boxObjects = new BehaviorSubject<boxObject[] | []>([]);
  box: any;
  space: any;

  showspinner() {}

  hidespinner() {}
  // 3BOX connection

  async setSpace(space: any) {
    this.space = space;
  }

  async getStatus() {}

  async storeHashIn3Box(space: any) {
    const connect = await ipfservice.setipfsHost()
    if(!connect){toast.error("Unable to connect to IPFS check your settings.", {autoClose:false}); return false;}
    if (typeof this.space == "undefined") {
      toast.error("You should connect to 3Box first", {autoClose:false});
      return false;
    }
    loaderservice.setLoading(true);
    await ipfservice.addToIpfs();
    //Utils.log("export 3box", ipfservice.cid, this.space);

    try {
      const ob = await localipfsstorage.createBoxObject();

      await this.space.private.set(ob.key, ob);
      toast.success("Stored in 3box");
      await this.getObjectsFrom3Box(space);
      loaderservice.setLoading(false);
    } catch (e) {}
  }

  async getObjectsFrom3Box(space: any) {
    //Utils.log("get objects from box");
    const hashes: boxObject[] = await space.private.all();
    let vals = Object.values(hashes)
    vals = await this.filterNulls(vals)
    //Utils.log(vals)
    vals.sort((a, b) => (a.timestamp > b.timestamp) ? -1 : 1)
    this.boxObjects.next(vals);
    //Utils.log(hashes);
    return Object.values(hashes);
  }

  async filterNulls(objects: boxObject[]) {
    var filtered = objects.filter(function (el) {
      return el.timestamp != null && el.timestamp!== undefined;
    });
    return filtered;
  }

  async deleteFrom3Box(args: string | undefined) {
    if (args !== undefined) {
      const key = args;
      //Utils.log("key", key);
      loaderservice.setLoading(true);
      await this.space.private.remove(key);
      await this.getObjectsFrom3Box(this.space);
      loaderservice.setLoading(false);
    }
  }
}
