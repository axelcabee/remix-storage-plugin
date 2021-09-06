import { PluginClient } from "@remixproject/plugin";
import { createClient } from "@remixproject/plugin-webview";
import { toast } from "react-toastify";
import { BehaviorSubject } from "rxjs";
import { client, fileservice, gitservice, ipfservice, Utils } from "../../App";

export class WorkSpacePlugin extends PluginClient {
  clientLoaded = new BehaviorSubject(false);
  callBackEnabled: boolean = true;

  constructor() {
    super();
    createClient(this);
    toast.info("Connecting to REMIX");
    this.methods = ['pull', 'track', 'diff']
    this.onload().then(async () => {
      //Utils.log("workspace client loaded", this);
      toast.success("Connected to REMIX");
      console.log(this)
      try {
        await this.call("manager", "activatePlugin", "dGitProvider")
        console.log("SET LOADED")
        this.clientLoaded.next(true);
        await this.setCallBacks();
      } catch (e) {
        console.log(e)
        toast.error("Could not activate DECENTRALIZED GIT. Please activate DECENTRALIZED GIT in the plugin list and restart this plugin.", { autoClose: false })
      }

      try {
        /* this.call('filePanel', 'registerContextMenuItem', {
          id: 'dgit',
          name: 'track',
          label: 'Track in dGit',
          type: ['file', 'folder'],
          extension: [],
          path: [],
          pattern: [],
          sticky: true
        }) */
      } catch (e) {

      }

    });

  }

  async diff(filename: string) {
    gitservice.fileToDiff = filename
    await gitservice.diffFiles(filename)
  }

  async track(item: any) {
    console.log('track')
  }

  async pull(cid: string) {
    try {
      await ipfservice.importFromCID(cid, "", false)
      //Utils.log("yes");
    } catch (e) {
      //Utils.log("no");
    }
  }

  async setCallBacks() {

    this.on("fileManager", "fileSaved", async (e) => {
      // Do something
      if (this.callBackEnabled) {
        Utils.log("file save",e);
        await fileservice.syncFromBrowser();

      }
    });

    this.on("fileManager", "fileAdded", async (e) => {
      // Do something
      if (this.callBackEnabled) {
        Utils.log("file add",e);
        await fileservice.syncFromBrowser();

        //Utils.log(e);
      }
    });

    this.on("fileManager", "fileRemoved", async (e) => {
      // Do something
      //Utils.log(e);
      if (this.callBackEnabled) {
        Utils.log("file rm",e);
        await fileservice.syncFromBrowser();
        
      }
      // await this.rmFile(e)
    });

    this.on("fileManager", "currentFileChanged", async (e) => {
      // Do something
      //Utils.log("CHANGED",e, this);
      if (this.callBackEnabled) {
        Utils.log("file changed",e);
        await fileservice.syncFromBrowser();
      }
      //await this.rmFile(e)
    });

    this.on("fileManager", "fileRenamed", async (oldfile, newfile) => {
      // Do something
      if (this.callBackEnabled) {
        Utils.log(oldfile, newfile);
        await fileservice.syncFromBrowser();

      }
    });

    this.on("filePanel", "setWorkspace", async (x: any) => {
      if (this.callBackEnabled) {
        Utils.log("ws set", x);
        await fileservice.syncFromBrowser(x.isLocalhost);
        Utils.log(x);
      }
    });

    this.on("filePanel", "deleteWorkspace", async (x: any) => {
      if (this.callBackEnabled) {
        Utils.log("wS DELETE", x);
        await fileservice.syncFromBrowser(x.isLocalhost);
        Utils.log(x);
      }
    });

    this.on("filePanel", "renameWorkspace", async (x: any) => {
      if (this.callBackEnabled) {
        Utils.log("wS rn", x);
        await fileservice.syncFromBrowser(x.isLocalhost);
        Utils.log(x);
      }
    });


    this.callBackEnabled = true;
  }



  async disableCallBacks() {
    console.log("DISABLE CALLBACK")
    this.callBackEnabled = false;
  }
  async enableCallBacks() {
    console.log("ENABLE CALLBACK")
    this.callBackEnabled = true;
  }
}
