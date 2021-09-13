import { BehaviorSubject } from "rxjs";
import { client, gitservice, ipfservice, Utils } from "../../App";
import { boxObject } from "../3box/3boxService";
import { default as dateFormat } from 'dateformat'
import { toast } from "react-toastify";
export class LocalIPFSStorage {
  boxObjects = new BehaviorSubject<boxObject[] | []>([]);
  objects: any[] = [];

  async init() {
    try {
      await this.read();
    } catch (e) {
      //Utils.log(e);
      await this.write();
    }
  }

  async read() {
    try{
      let r = await client.call('dGitProvider','getItem','dgit-ipfs')
      this.objects = r? JSON.parse(r):[];
      this.objects.sort((a, b) => (a.timestamp > b.timestamp) ? -1 : 1)
      this.objects = await this.filterNulls();
      //Utils.log("READ CONFIG",this.objects);
      this.boxObjects.next(this.objects);
    }catch(e){
      Utils.log(e)
    }
  }

  async write() {
    try{
      await client.call('dGitProvider','setItem','dgit-ipfs', JSON.stringify(await this.filterNulls()) )
    }catch(e){
      
    }
  }

  async addToStorage(box: boxObject) {
    await this.init();
    await this.deleteFromStorage(box.cid)
    this.objects.push(box);
    await this.write();
    await this.read();
  }

  async filterNulls() {
    var filtered = this.objects.filter(function (el) {
      return el != null;
    });
    return filtered;
  }

  async deleteFromStorage(cid: string | undefined) {
    if (cid !== undefined) {
      await this.read();
      this.objects = this.objects.filter((i) => i.cid !== cid);
      await this.write();
      await this.read();
    }
  }

  async createBoxObject() {
    await this.init();
    try{
      const commits = await gitservice.getCommits();
      let key = gitservice.reponame;
      let ob: boxObject = {
        key: key,
        cid: ipfservice.cid,
        datestored: dateFormat(new Date(),"dddd, mmmm dS, yyyy, h:MM:ss TT"),
        datecommit: dateFormat(new Date(commits[0].commit.committer.timestamp * 1000), "dddd, mmmm dS, yyyy, h:MM:ss TT"),
        timestamp: Date.now(),
        ref: commits[0].oid,
        message: commits[0].commit.message,
      };
      return ob;
    }catch(e){
      let key = gitservice.reponame;
      let ob: boxObject = {
        key: key,
        cid: ipfservice.cid,
        datestored: dateFormat(new Date(),"dddd, mmmm dS, yyyy, h:MM:ss TT"),
        datecommit: "no commits",
        timestamp: Date.now(),
        ref: "no commits",
        message: "no commits",
      };
      return ob;
    }

  }
}
