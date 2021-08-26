import git, { ReadCommitResult } from "isomorphic-git";
import { client, fileservice, Utils } from "../../App";
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
  branches = new BehaviorSubject<string[] | undefined>(undefined);
  diffResult = new BehaviorSubject<diffObject[] | undefined>(undefined);
  reponameSubject = new BehaviorSubject<string>("");
  canCommit = new BehaviorSubject<boolean>(true);
  canExport = new BehaviorSubject<boolean>(false);
  reponame = "";

  async init() {
    await client.call("dGitProvider", "init");
    await fileservice.showFiles();
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

    await client.call("dGitProvider", "add", {
      filepath: removeSlash(filename),
    });
    await fileservice.showFiles();
    toast.success(`Removed file file ${filename}`);
  }

  async checkoutfile(filename: any) {
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
          Utils.addSlash(filename),
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
        this.branch.next(`Branch is: ${branch} at commit ${currentcommitoid}`);
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
    //Utils.log("commit");
    // let filescommited = await this.listFilesInstaging();
    // //Utils.log(filescommited);
    // if (filescommited.length === 0) {
    //   toast.error("no files to commit");
    //   return;
    // }
    const sha = await client.call("dGitProvider", "commit", {
      author: {
        name: localStorage.getItem('GITHUB_NAME') || 'Remix Workspace',
        email: localStorage.getItem('GITHUB_EMAIL'),
      },
      message: message,
    });
    toast.success(`Commited: ${sha}`);

    await fileservice.showFiles();
  }

  async getBranches() {
    let branches: string[] = await client.call("dGitProvider", "branches");
    this.branches.next(branches);
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
    Utils.log("calll status");
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

  async clone(url: string, branch: string, token: string) {
    try {
      await client.disableCallBacks()
      await client.call("dGitProvider", "clone" as any, { url, branch, token });
      await client.enableCallBacks()
      await fileservice.syncFromBrowser(false)
      toast.success("Cloned")
    } catch (e) {
      toast.error(e.message)
    }
  }

  async push(url: string, branch: string, token: string, force: boolean, name: string, email: string) {
    try {
      const result = await client.call("dGitProvider", "push" as any, { url, branch, token, force, name, email });
      toast.success("Pushed")
    } catch (e) {
      toast.error(e.message)
    }
  }

  async pull(url: string, branch: string, token: string,name: string, email: string) {
    try {
      await client.disableCallBacks()
      await client.call("dGitProvider", "pull" as any, { url, branch, token, name, email });
      await client.enableCallBacks()
      await fileservice.syncFromBrowser(false)
      toast.success("Pulled")
    } catch (e) {
      toast.error(e.message)
    }
  }

  async fetch(url: string, branch: string, token: string, name: string, email: string) {
    try {
      await client.disableCallBacks()
      await client.call("dGitProvider", "fetch" as any, { url, branch, token, name, email });
      await client.enableCallBacks()
      await fileservice.syncFromBrowser(false)
      toast.success("Fetched")
    } catch (e) {
      toast.error(e.message)
    }
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

  async diffFiles() {
    const statuses = fileservice.fileStatusResult;
    //Utils.log(statuses);
    const diffs: diffObject[] = [];
    for (let i: number = 0; i < statuses.length; i++) {
      if ((statuses[i].statusNames?.indexOf("modified") || false) > -1) {
        //Utils.log(statuses[i].statusNames?.indexOf("modified"));
        const diff: diffObject = await this.diffFile(statuses[i].filename);
        diffs.push(diff);
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
