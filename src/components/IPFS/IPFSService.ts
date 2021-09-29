import IpfsHttpClient from "ipfs-http-client";
import { toast } from "react-toastify";
import { BehaviorSubject } from "rxjs";
import { resetFileSystem, fileservice, gitservice, ipfservice, loaderservice, client, Utils } from "../../App";

export interface ipfsConfig {
  host: string;
  port: number;
  protocol: string;
  ipfsurl?: string;
}

export interface ipfsFileObject {
  path: string;
  content: string;
}

export class IPFSService {
  ipfsconfig: ipfsConfig = {
    host: process.env.REACT_APP_DEFAULT_IPFS_HOST || "",
    port: parseInt(process.env.REACT_APP_DEFAULT_IPFS_PORT || "0"),
    protocol: process.env.REACT_APP_DEFAULT_IPFS_PROTOCOL || "",
    ipfsurl: process.env.REACT_APP_DEFAULT_IPFS_GATEWAY || "",
  };

  pinataConfig = {
    key: "",
    secret: ""
  }

  filesToSend: ipfsFileObject[] = [];
  cid: string = "";
  cidBehavior = new BehaviorSubject<string>("");
  connectionStatus = new BehaviorSubject<boolean>(false)
  pinataConnectionStatus = new BehaviorSubject<boolean>(false)
  
  async getipfsurl() {
    return this.ipfsconfig.ipfsurl;
    //return $("#IPFS-url").val() != "" ? $("#IPFS-url").val() : false || ipfsurl;
  }

  async setipfsHost() {
    Utils.log(this.ipfsconfig)
    try {
      setTimeout(() => {
        client.cancel('dGitProvider' as any,'setIpfsConfig')
      },2000)
      const c = await client.call("dGitProvider", "setIpfsConfig", this.ipfsconfig ) 
      Utils.log(c)
      this.connectionStatus.next(c)
      return true;
    } catch (e) {
      Utils.log(e)
      toast.error(
        "There was an error connecting to IPFS, please check your IPFS settings if applicable."
      );
      this.connectionStatus.next(false)
      loaderservice.setLoading(false)
      return false;
    }
  }

  async addFilesToPinata(){
    loaderservice.setLoading(true)
    try{
      let result = await client.call("dGitProvider" as any, "pin",this.pinataConfig.key,this.pinataConfig.secret);
      this.cid = result;
      this.cidBehavior.next(this.cid);
      toast.success(`You files were uploaded to Pinata IPFS`);
      loaderservice.setLoading(false)
      this.pinataConnectionStatus.next(false)
      this.pinataConnectionStatus.next(true)
    }catch(err){
      toast.error(
        "There was an error uploading to Pinata, please check your Pinata settings."
      );
      toast.error("There was an error uploading to Pinata!",{autoClose:false});
      loaderservice.setLoading(false)
    }
  }

  async addToIpfs() {
    const connect = await this.setipfsHost()
    if(!connect){toast.error("Unable to connect to IPFS check your settings.",{autoClose:false}); return false;}
    loaderservice.setLoading(true)
    try {
      const result = await client.call('dGitProvider', 'export' as any)
      Utils.log(result)
      this.cid = result;
      this.cidBehavior.next(this.cid);
      toast.success(`You files were uploaded to IPFS`);
      loaderservice.setLoading(false)
    } catch (e) {
      toast.error(
        "There was an error uploading to IPFS, please check your IPFS settings if applicable."
      );
      toast.error("There was an error uploading to IPFS!",{autoClose:false});
      loaderservice.setLoading(false)
      //Utils.log(e);
    }

    return true;
  }

  async addAndOpenInVscode(){
    await this.addToIpfs()
    window.open(`vscode://${process.env.REACT_APP_REMIX_EXTENSION}/pull?cid=${this.cid}`)
    return `vscode://${process.env.REACT_APP_REMIX_EXTENSION}/pull?cid=${this.cid}`;
  }

  async importFromCID(cid: string | undefined, name:string = "", local:boolean = false) {
    toast.dismiss()
    const connect = await this.setipfsHost()
    if(!connect){toast.error("Unable to connect to IPFS check your settings.",{autoClose:false}); return false;}
    if (cid !== undefined) {
      //Utils.log("cid", cid);
      this.cid = cid;
      //$("#ipfs").val(ipfservice.cid);
      await ipfservice.clone(local);
    }
  }

  async clone(local:boolean) {
    await client.disableCallBacks()
    loaderservice.setLoading(true)
    const connect = await this.setipfsHost()
    if(!connect){toast.error("Unable to connect to IPFS check your settings.",{autoClose:false}); return false;}
    const cid = this.cid;
    //Utils.log(cid);
    if (cid === "" || typeof cid == "undefined" || !cid) {
      return false;
    }
    try {
      Utils.log("IMPORT START")
      await client.call('dGitProvider', 'import' as any, {cid:cid, local:local})
      Utils.log("IMPORT DONE")
      loaderservice.setLoading(false)
      //await fileservice.syncToBrowser();
      await fileservice.syncStart()
    } catch (e) {
      loaderservice.setLoading(false)
      await client.enableCallBacks()
      Utils.log(e.message)
      toast.error(e.message,{autoClose:false});
      toast.error('Sometimes the IPFS data is not yet available. Please try again later.',{autoClose:false});
    }
    
  }
}
