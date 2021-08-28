import React, { useContext, useEffect, useState } from "react";
import "./App.css";
import { Container, Tabs, Tab, ProgressBar, Accordion, useAccordionButton } from "react-bootstrap";

import WalletConnectProvider from "@walletconnect/web3-provider";

import { FileExplorer } from "./components/Files/FileExplorer";
import { GitControls } from "./components/git/UI/gitControls";

import { IPFSView } from "./components/IPFS/IPFSView";
import { WorkSpacePlugin } from "./components/Remix/Client";
import { gitService } from "./components/git/gitService";

import { LsFileService } from "./components/Files/FileService";
import { FileTools } from "./components/Files/FileTools";
import { DiffView } from "./components/git/diff/Diff";
import { IPFSService } from "./components/IPFS/IPFSService";
import { BoxService } from "./components/3box/3boxService";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Importer } from "./components/Import/importer";
import Loading from "react-fullscreen-loading";
import { LoaderService } from "./components/loaderService";
import { useBehaviorSubject } from "./components/usesubscribe/index";
import { Help } from "./components/Help";
import { LocalIPFSStorage } from "./components/LocalStorage/LocalStorage";
import { LocalHostWarning } from "./components/LocalHostWarning";
import { IPFSConfig } from "./components/IPFS/IPFSConfig";
import { GitStatus } from "./components/git/UI/gitStatus";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FileHelp } from "./components/Files/FileHelp";
import { GitHelp } from "./components/git/UI/GitHelp";
import { ExportHelp } from "./components/IPFS/ExportHelp";
import { ImportHelp } from "./components/Import/ImportHelp";
import { ConfigHelp } from "./components/IPFS/ConfigHelp";
import { devutils } from "./components/Utils";
import { PinataConfig } from "./components/IPFS/PinataConfig";
import { GitHubImporter } from "./components/github/github";
import { CompactExplorer } from "./components/Files/CompactExplorer";

export const Utils: devutils = new devutils();

export const gitservice: gitService = new gitService();
export const client: WorkSpacePlugin = new WorkSpacePlugin();
export const fileservice: LsFileService = new LsFileService();
export const ipfservice: IPFSService = new IPFSService();
export const boxservice: BoxService = new BoxService();
export const loaderservice: LoaderService = new LoaderService();
export const localipfsstorage: LocalIPFSStorage = new LocalIPFSStorage();

export const resetFileSystem = async (wipe: boolean = false) => {
  try {

    client.clientLoaded.subscribe(async (load: boolean) => {
      await localipfsstorage.init();
      //if (load) await ipfservice.setipfsHost();
      if (load) await fileservice.syncStart();
      if (load) await ipfservice.setipfsHost();
    });
    return true;
    //await fileservice.showFiles();
  } catch (e) {
    //Utils.log("FS WARNING")
    return false;
  }
};

export const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: "83d4d660ce3546299cbe048ed95b6fad",
      bridge: 'https://wallet-connect-bridge.dyn.plugin.remixproject.org:8080/'
    },
  },
};

function App() {
  const [activeKey, setActiveKey] = useState<string>("files");
  const loading: boolean | undefined = useBehaviorSubject(
    loaderservice.loading
  );
  const [canLoad, setCanLoad] = useState<boolean>(false);
  const repoName = useBehaviorSubject(gitservice.reponameSubject);
  const storageUsed = useBehaviorSubject(gitservice.storageUsed);
  const canCommit = useBehaviorSubject(gitservice.canCommit);
  const canUseApp = useBehaviorSubject(fileservice.canUseApp);
  const [confirmShow, setConfirmShow] = React.useState(false);

  const maxStorage: number = 10000;

  gitservice.reponameSubject.subscribe((x) => { }).unsubscribe();
  gitservice.canCommit.subscribe((x) => { }).unsubscribe();
  loaderservice.loading.subscribe((x) => { }).unsubscribe();
  fileservice.canUseApp.subscribe((x) => { }).unsubscribe();

  const setTab = async (key: string) => {
    setActiveKey(key);
    if (key == "diff") {
      //loaderservice.setLoading(true);
      await gitservice.diffFiles();
      //loaderservice.setLoading(false);
    }
  };

  const storageVariant = () => {
    const percentageUsed = parseFloat(storageUsed || '0') / maxStorage * 100
    let variant = 'success'
    if (percentageUsed > 50) variant = 'warning'
    if (percentageUsed > 80) variant = 'danger'
    return variant
  }

  useEffect(() => {
    resetFileSystem(false).then((x) => setCanLoad(x));
  }, []);

  function CustomToggle(ob:any) {
    const decoratedOnClick = useAccordionButton(ob.eventKey, () =>
      console.log('totally custom!'),
    );
  
    return (
      <>
      <button
        type="button"
        className='btn btn-sm'
        onClick={decoratedOnClick}
      >
        {ob.children}
      </button><hr></hr>
      </>
    );
  }
  

  return (
    <div className="App">
      {!canUseApp ? (
        <LocalHostWarning canLoad={canUseApp} />
      ) : (
        <Container fluid>
          {loading ? (
            <Loading loading background="#2ecc71" loaderColor="#3498db" />
          ) : (
            <></>
          )}
          <FontAwesomeIcon icon={faExclamationTriangle}></FontAwesomeIcon><a className='small pl-2' href='https://github.com/bunsenstraat/remix-storage-plugin/issues' target='_blank'>Submit issues</a>
          <div className="nav navbar bg-light p-3"><div><div className="float-left pr-1 m-0">dGit</div> | repo: {repoName} | storage: {storageUsed}KB / 10000KB</div></div>
          <ProgressBar variant={storageVariant()} label="storage used" now={parseFloat(storageUsed || '0')} min={0} max={10000} />
          <GitStatus></GitStatus>
          <br></br>
          {canCommit ? (
            <></>
          ) : (
            <div className="alert alert-warning w-25">
              You are in a detached state.<br></br>
            </div>
          )}
          <ToastContainer position="top-right" />
          <Accordion defaultActiveKey="0">
              <CustomToggle eventKey="0">FILES</CustomToggle>
              <Accordion.Collapse eventKey="0">
                <CompactExplorer/>
              </Accordion.Collapse>
              <CustomToggle eventKey="1">GITHUB</CustomToggle>
              <Accordion.Collapse eventKey="1">
                <GitHubImporter/>
              </Accordion.Collapse>
          </Accordion>

          {/*           <Tabs
            activeKey={activeKey}
            onSelect={async (k) => await setTab(k || "files")}
          >
            <Tab className="mt-4 ml-1" eventKey="files" title="FILES">
              <FileExplorer setTab={setTab} />
              <FileTools/>
              <FileHelp/>
            </Tab>
            <Tab className="mt-4 ml-1" eventKey="git" title="GIT">
              <GitControls />
              <GitHelp/>
            </Tab>
            <Tab className="mt-4 ml-1" eventKey="github" title="GITHUB">
                <GitHubImporter/>
            </Tab>
            <Tab className="mt-4 ml-1" eventKey="export" title="EXPORT">
              <IPFSView />
              <ExportHelp/>
            </Tab>
            <Tab className="mt-4 ml-1" eventKey="import" title="IMPORT">
              <Importer />
              <ImportHelp></ImportHelp>
            </Tab>
            <Tab className="mt-4 ml-1" eventKey="diff" title="DIFF">
              <DiffView />
            </Tab>
            <Tab className="mt-4 ml-1" eventKey="config" title="SETTINGS">
              <PinataConfig></PinataConfig>
              <IPFSConfig />
              <ConfigHelp/>
            </Tab>
            <Tab className="mt-4 ml-1" eventKey="help" title="HELP">
              <Help />
            </Tab>
          </Tabs> */}
        </Container>
      )}
    </div>
  );
}

// Hook
export const useLocalStorage = (key: string, initialValue: any) => {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<any>(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.log(error);
      return initialValue;
    }
  });
  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: any | ((val: any) => any)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error);
    }
  };
  return [storedValue, setValue] as const;
}

export default App;
