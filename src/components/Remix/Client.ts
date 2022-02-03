import { PluginClient } from "@remixproject/plugin";
import { createClient } from "@remixproject/plugin-webview";
import { toast } from "react-toastify";
import { BehaviorSubject } from "rxjs";
import { fileservice, gitservice, ipfservice, Utils } from "../../App";

export class WorkSpacePlugin extends PluginClient {
  clientLoaded = new BehaviorSubject(false);
  callBackEnabled: boolean = true;

  constructor() {
    super();
    createClient(this);
    //toast.info("Connecting to REMIX");
    this.methods = ['pull', 'track', 'diff', 'clone']
    this.onload().then(async () => {
      //Utils.log("workspace client loaded", this);
      //toast.success("Connected to REMIX");
      Utils.log(this)
      try {
        await this.call("manager", "activatePlugin", "dGitProvider")
        Utils.log("SET LOADED")
        this.clientLoaded.next(true);
        await this.setCallBacks();
      } catch (e) {
        Utils.log(e)
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

  async clone(name: string, repo: string, branch: string) {
    const url = `https://github.com/${name}/${repo}`
    await gitservice.clone(url, branch, '', 1, false)
  }

  async diff(filename: string) {
    gitservice.fileToDiff = filename
    await gitservice.diffFiles(filename)
  }

  async track(item: any) {
    Utils.log('track')
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

    this.on("filePanel", "deleteWorkspace" as any, async (x: any) => {
      if (this.callBackEnabled) {
        Utils.log("wS DELETE", x);
        await fileservice.syncFromBrowser(x.isLocalhost);
        Utils.log(x);
      }
    });

    this.on("filePanel", "renameWorkspace" as any, async (x: any) => {
      if (this.callBackEnabled) {
        Utils.log("wS rn", x);
        await fileservice.syncFromBrowser(x.isLocalhost);
        Utils.log(x);
      }
    });


    this.callBackEnabled = true;
  }



  async disableCallBacks() {
    Utils.log("DISABLE CALLBACK")
    this.callBackEnabled = false;
  }
  async enableCallBacks() {
    Utils.log("ENABLE CALLBACK")
    this.callBackEnabled = true;
  }
}
