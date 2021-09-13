import git, { ReadCommitResult } from "isomorphic-git";
import { client, fileservice, loaderservice, Utils } from "../../App";
import { toast } from "react-toastify";
import path from "path";
import { removeSlash } from "../Files/utils";
import { BehaviorSubject } from "rxjs";
import { fileStatuses } from "../Files/FileService";

export interface diffObject {
  originalFileName: string;
  updatedFileName: string;
  past: string;
  current: string;
}
export class gitService {
  commits = new BehaviorSubject<ReadCommitResult[] | undefined>(undefined);
  branch = new BehaviorSubject<string>("");
  branches = new BehaviorSubject<any[] | undefined>(undefined);
  remotes = new BehaviorSubject<any[] | undefined>(undefined);
  diffResult = new BehaviorSubject<diffObject[] | undefined>(undefined);
  reponameSubject = new BehaviorSubject<string>("");
  canCommit = new BehaviorSubject<boolean>(true);
  canExport = new BehaviorSubject<boolean>(false);
  storageUsed = new BehaviorSubject<string>("");
  reponame = "";
  fileToDiff:string = ''

  async init() {
    try {
      await client.call("dGitProvider", "init");
      toast.success('Git repository initialized')
      await fileservice.showFiles();
    } catch (e) {
      toast.error(`There were errors on initializing git: ${e.message}`)
    }

  }

  async addAllToGit() {
    try {
      await client
        .call("dGitProvider", "status", { ref: "HEAD" })
        .then((status) =>
          Promise.all(
            status.map(([filepath, , worktreeStatus]) =>
              worktreeStatus
                ? client.call("dGitProvider", "add", {
                  filepath: removeSlash(filepath),
                })
                : client.call("dGitProvider", "rm", {
                  filepath: removeSlash(filepath),
                })
            )
          )
        );
      await fileservice.showFiles();
      toast.success(`Added all`);
    } catch (e) {
      toast.error(`${e}`);
    }
  }

  async addToGit(args: string | undefined) {
    if (args !== undefined) {
      let filename = args; // $(args[0].currentTarget).data('file')
      let stagingfiles;
      if (filename !== "/") {
        filename = removeSlash(filename);
        stagingfiles = [filename];
      } else {
        await this.addAllToGit();
        return;
      }
      //Utils.log(stagingfiles);
      try {
        for (const filepath of stagingfiles) {
          try {
            await client.call("dGitProvider", "add", {
              filepath: removeSlash(filepath),
            });
          } catch (e) { }
        }
        await fileservice.showFiles();
        toast.success(`Added ${filename}`);
      } catch (e) {
        toast.error(`${e}`);
      }
    }
  }

  async gitrm(args: any) {
    ////Utils.log('RM GIT', $(args[0].currentTarget).data('file'))
    const filename = args; // $(args[0].currentTarget).data('file')

    await client.call("dGitProvider", "rm", {
      filepath: removeSlash(filename),
    });
    await fileservice.showFiles();
    toast.success(`Removed file file ${filename}`);
  }

  async checkoutfile(filename: any) {
    //await client.call('fileManager' as any, 'closeAllFiles')
    ///const filename = ""; //$(args[0].currentTarget).data('file')
    //Utils.log("checkout", [`${filename}`], removeSlash(filename));
    let oid = await this.getLastCommmit();
    if (oid)
      try {
        const commitOid = await client.call("dGitProvider", "resolveref", {
          ref: oid,
        });
        const { blob } = await client.call("dGitProvider", "readblob", {
          oid: commitOid,
          filepath: removeSlash(filename),
        });
        const original = Buffer.from(blob).toString("utf8");
        //(original, filename);
        await client.disableCallBacks();
        await client.call(
          "fileManager",
          "setFile",
          removeSlash(filename),
          original
        );
        await client.enableCallBacks();
        await fileservice.syncFromBrowser();
        //await fileservice.showFiles()
        //await fileservice.syncToBrowser();
        //await fileservice.syncStart()
      } catch (e) {
        //Utils.log(e);
        toast.error("No such file");
        //this.addAlert("checkoutMessage", e)
      }
  }

  async checkout(cmd: any) {
    toast.dismiss();
    await client.disableCallBacks();
    await client.call('fileManager', 'closeAllFiles')
    try {
      await client.call("dGitProvider", "checkout", cmd);
      this.gitlog();
    } catch (e) {
      //Utils.log(e);
      toast.error(" " + e, { autoClose: false });
    }
    await client.enableCallBacks();
    //Utils.log("done");
    //await fileservice.syncToBrowser();
    await fileservice.syncStart();
  }

  async getCommits() {
    //Utils.log("get commits");
    try {
      const commits: ReadCommitResult[] = await client.call(
        "dGitProvider",
        "log",
        { ref: "HEAD" }
      );
      return commits;
    } catch (e) {
      return [];
    }
  }

  async gitlog() {
    //Utils.log("log");
    try {
      const commits: ReadCommitResult[] = await this.getCommits();
      this.commits.next(commits);
      //Utils.log(commits);
    } catch (e) {
      this.commits.next([]);
      //Utils.log(e);
    }

    await this.showCurrentBranch();
  }

  async createBranch(name: string = "") {
    const branch = name; //|| $("#newbranchname").val();
    if (branch)
      await await client.call("dGitProvider", "branch", { ref: branch });

    fileservice.showFiles();
  }

  async showCurrentBranch() {
    try {
      const branch = await this.currentBranch();
      const currentcommitoid = await this.getCommitFromRef("HEAD");
      //Utils.log("current commid id", currentcommitoid);
      this.branch.next(branch);
      if (typeof branch === "undefined" || branch === "") {
        //toast.warn(`You are in a detached state`);
        this.branch.next(`HEAD detached at ${currentcommitoid}`);
        this.canCommit.next(false);
      } else {
        this.branch.next(branch);
        this.canCommit.next(true);
      }
    } catch (e) {
      this.branch.next("");
    }
  }

  async getLastCommmit() {
    try {
      let currentcommitoid = "";
      currentcommitoid = await this.getCommitFromRef("HEAD");
      return currentcommitoid;
    } catch (e) {
      return false;
    }
  }

  async currentBranch() {
    try {
      const branch: string =
        (await client.call("dGitProvider", "currentbranch")) || "";
      //Utils.log("BRANCH", branch);
      return branch;
    } catch (e) {
      throw e;
    }
  }

  async commit(message: string = "") {

    try {
      const sha = await client.call("dGitProvider", "commit", {
        author: {
          name: localStorage.getItem('GITHUB_NAME') || 'Remix Workspace',
          email: localStorage.getItem('GITHUB_EMAIL'),
        },
        message: message,
      });
      toast.success(`Commited: ${sha}`);
  
      await fileservice.showFiles();
    } catch (err) {
      toast.error(`${err}`)
    }

  }

  async getBranches() {
    let branches: any[] = await client.call("dGitProvider", "branches");
    this.branches.next(branches);
  }
  async getRemotes() {
    let remotes: any = await client.call("dGitProvider", "remotes" as any);
    this.remotes.next(remotes || []);
  }

  async getStorageUsed() {
    let storage: string = await client.call("dGitProvider", "localStorageUsed" as any);
    this.storageUsed.next(storage);
  }

  async getCommitFromRef(ref: string) {
    const commitOid = await client.call("dGitProvider", "resolveref", {
      ref: ref,
    });
    return commitOid;
  }

  async getFileContentCommit(fullfilename: string, commitOid: string) {
    let content = "";
    try {
      const { blob } = await client.call("dGitProvider", "readblob", {
        oid: commitOid,
        filepath: removeSlash(fullfilename),
      });
      content = Buffer.from(blob).toString("utf8");
    } catch (e) {
      //Utils.log(e);
    }
    return content;
  }

  async statusMatrix(dir: string = "/", ref: string = "HEAD") {
    Utils.log("call status");
    const matrix = await client.call("dGitProvider", "status", { ref: "HEAD" });
    Utils.log("MATRIX", matrix);
    let result = (matrix || []).map((x) => {
      return {
        filename: `/${x.shift()}`,
        status: x,
      };
    });
    return result;
  }

  async clone(url: string, branch: string, token: string, depth: number, singleBranch: boolean) {
    loaderservice.setLoading(true)
    try {
      await client.disableCallBacks()
      await client.call("dGitProvider", "clone" as any, { url, branch, token, depth, singleBranch });
      await client.enableCallBacks()
      await fileservice.syncFromBrowser(false)
      toast.success("Cloned")
    } catch (e) {
      toast.error(e.message)
    }
    loaderservice.setLoading(false)
  }



  async addRemote(remote: string, url: string) {
    loaderservice.setLoading(true)
    try {
      await client.call("dGitProvider", "addremote" as any, { remote, url });
      toast.success("Remote added")
    } catch (e) {
      toast.error("Please init your repo first...")
    }
    loaderservice.setLoading(false)
  }

  async delRemote(remote: string) {
    loaderservice.setLoading(true)
    try {
      await client.call("dGitProvider", "delremote" as any, { remote });
      toast.success("Remote removed")
    } catch (e) {
      toast.error(e.message)
    }
    loaderservice.setLoading(false)
  }

  async push(remote: string, ref: string, remoteRef: string, token: string, force: boolean, name: string, email: string) {
    loaderservice.setLoading(true)
    try {
      const result = await client.call("dGitProvider", "push" as any, { remote, ref, remoteRef, token, force, name, email });
      
      toast.success("Pushed")
    } catch (e) {
      toast.error(e.message)
    }
    loaderservice.setLoading(false)
  }

  async pull(remote: string, ref: string, remoteRef: string, token: string,name: string, email: string) {
    loaderservice.setLoading(true)
    try {
      await client.disableCallBacks()
      await client.call("dGitProvider", "pull" as any, { remote, ref, remoteRef, token, name, email });
      await client.enableCallBacks()
      await fileservice.syncFromBrowser(false)
      toast.success("Pulled")
    } catch (e) {
      await client.enableCallBacks()
      toast.error(e.message)
    }
    loaderservice.setLoading(false)
  }

  async fetch(remote: string, ref: string, remoteRef: string, token: string, name: string, email: string) {
    loaderservice.setLoading(true)
    try {
      await client.disableCallBacks()
      await client.call("dGitProvider", "fetch" as any, { remote, ref, remoteRef, token, name, email });
      await client.enableCallBacks()
      await fileservice.syncFromBrowser(false)
      toast.success("Fetched")
    } catch (e) {
      toast.error(e.message)
    }
    loaderservice.setLoading(false)
  }

  async getStatusMatrixFiles() {
    Utils.log("getStatusMatrixFiles");
    const matrix = await this.statusMatrix();
    Utils.log("matrix", matrix);
    let files = matrix.map((f) => {
      Utils.log(f);
      return f.filename;
    });
    Utils.log("matrix files", files);
    return files;
  }

  async checkForFilesCommmited() {
    try {
      await this.listFiles();
      this.canExport.next(true);
      return true;
    } catch (e) {
      this.canExport.next(true);
      return false;
    }
  }

  async listFiles(dir: string = "/", ref: string = "HEAD") {
    let filescommited = await client.call("dGitProvider", "lsfiles", {
      ref: ref,
    });
    return filescommited;
  }

  async listFilesInstaging(dir: string = "/") {
    let filesInStaging = await client.call("dGitProvider", "lsfiles", {
      ref: "HEAD",
    });
    return filesInStaging;
  }

  async addAll() {
    const statuses = fileservice.fileStatusResult;
    //Utils.log(statuses);

    for (let i: number = 0; i < statuses.length; i++) {
      await this.addToGit(statuses[i].filename);
    }
  }

  async diffFiles(filename:string | undefined) {
    const statuses = fileservice.fileStatusResult;
    if(this.fileToDiff) filename = this.fileToDiff
    //Utils.log(statuses);
    const diffs: diffObject[] = [];
    for (let i: number = 0; i < statuses.length; i++) {
      if ((statuses[i].statusNames?.indexOf("modified") || false) > -1) {
        //Utils.log(statuses[i].statusNames?.indexOf("modified"));
        if((filename && statuses[i].filename === filename) || !filename){
          const diff: diffObject = await this.diffFile(statuses[i].filename);
          diffs.push(diff);
        }
      }
    }
    this.diffResult.next(diffs);
  }

  async zip() {
    await client.call(
      "dGitProvider",
      "zip"
    );
  }

  async diffFile(args: any) {
    //$('#files').hide()
    //$('#diff-container').show()
    //Utils.log("DIFF", args);
    const fullfilename = args; // $(args[0].currentTarget).data('file')
    try {
      const commitOid = await client.call(
        "dGitProvider",
        "resolveref",
        { ref: "HEAD" }
      );

      const { blob } = await client.call("dGitProvider", "readblob", {
        oid: commitOid,
        filepath: removeSlash(fullfilename),
      });

      const newcontent = await client.call(
        "fileManager",
        "readFile",
        removeSlash(fullfilename)
      );
      const original = Buffer.from(blob).toString("utf8");

      // Utils.log(original);
      //Utils.log(newcontent);
      //const filediff = createPatch(filename, original, newcontent); // diffLines(original,newcontent)
      ////Utils.log(filediff)
      const filediff: diffObject = {
        originalFileName: fullfilename,
        updatedFileName: fullfilename,
        current: newcontent,
        past: original,
      };

      return filediff;
    } catch (e) {
      toast("Nothing to diff! " + fullfilename);

      const filediff: diffObject = {
        originalFileName: "",
        updatedFileName: "",
        current: "",
        past: "",
      };
      return filediff;
    }
  }
}
