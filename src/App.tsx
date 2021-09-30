import React, { useContext, useEffect, useState } from "react";
import "./App.css";
import { Container, ProgressBar, Accordion, AccordionContext, Button, useAccordionToggle } from "react-bootstrap";

import WalletConnectProvider from "@walletconnect/web3-provider";

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

import { LocalIPFSStorage } from "./components/LocalStorage/LocalStorage";
import { LocalHostWarning } from "./components/LocalHostWarning";
import { IPFSConfig } from "./components/IPFS/IPFSConfig";
import { GitStatus } from "./components/git/UI/gitStatus";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle, faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";

import { devutils } from "./components/Utils";
import { PinataConfig } from "./components/IPFS/PinataConfig";
import { GitHubImporter } from "./components/github/github";
import { CompactExplorer } from "./components/Files/CompactExplorer";
import { GitBranch } from "./components/git/UI/gitBranch";
import { GitLog } from "./components/git/UI/gitLog";


export const Utils: devutils = new devutils();

export const gitservice: gitService = new gitService();
export const client: WorkSpacePlugin = new WorkSpacePlugin();
export const fileservice: LsFileService = new LsFileService();
export const ipfservice: IPFSService = new IPFSService();
export const boxservice: BoxService = new BoxService();
export const loaderservice: LoaderService = new LoaderService();
export const localipfsstorage: LocalIPFSStorage = new LocalIPFSStorage();

export const resetFileSystem = async (wipe: boolean = false) => {
  Utils.log("RESET FILE")
  try {

    client.clientLoaded.subscribe(async (load: boolean) => {

      //if (load) await ipfservice.setipfsHost();
      Utils.log("CLIENT LOADED", load)
      if (load === true) {

      }
      if (load === true) await localipfsstorage.init();
      if (load === true) await fileservice.syncStart();

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
  const [compact, setCompact] = useState<boolean>(false)
  const [diffViewer, setDiffViewer] = useState<boolean>(false)
  const maxStorage: number = 10000;

  gitservice.reponameSubject.subscribe((x) => { }).unsubscribe();
  gitservice.canCommit.subscribe((x) => { }).unsubscribe();
  loaderservice.loading.subscribe((x) => { }).unsubscribe();
  fileservice.canUseApp.subscribe((x) => { }).unsubscribe();

  const setTab = async (key: string) => {
    setActiveKey(key);
    if (key == "diff") {
      //loaderservice.setLoading(true);
      await gitservice.diffFiles('');
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
    Utils.log(window.location.href)
    setCompact(true)
    if (window.location.href.includes('diff')) {
      setDiffViewer(true)
    }
    resetFileSystem(false).then((x) => setCanLoad(x));
  }, []);

  function CustomToggle(ob: any) {

    const currentEventKey = useContext(AccordionContext);
    const isCurrentEventKey = currentEventKey === ob.eventKey
    const decoratedOnClick = useAccordionToggle(
      ob.eventKey,
      () => ob.callback && ob.callback(ob.eventKey),
    );


    return (
      <>
        <div onClick={decoratedOnClick} className='w-100 list-group-item p-0 pointer mb-1'>
          <Accordion.Toggle eventKey={ob.eventKey}
            as={Button}
            variant="link"
          >

            {ob.children}

          </Accordion.Toggle>
          {
            isCurrentEventKey ? <FontAwesomeIcon className='ml-2 mr-2 mt-2 float-right' icon={faCaretUp}></FontAwesomeIcon> : <FontAwesomeIcon className='ml-2 mr-2 mt-2 float-right' icon={faCaretDown}></FontAwesomeIcon>
          }
        </div>
      </>
    );
  }


  return (
    <div className="App">
      {!canUseApp ? (
        <LocalHostWarning canLoad={canUseApp} />
      ) : (
        diffViewer ? <>
          <Container fluid>

            <h4 className='mt-3'>dGit Diff viewer</h4>
            <DiffView />
          </Container>

        </> :

          (<Container fluid>
            {loading ? (
              <Loading loading background="#2ecc71" loaderColor="#3498db" />
            ) : (
              <></>
            )}

            <div className="nav navbar bg-light p-3"><div><div className="float-left pr-1 m-0">dGit</div> | repo: {repoName} | storage: {storageUsed}KB / 10000KB</div></div>
            <ProgressBar variant={storageVariant()} label="storage used" now={parseFloat(storageUsed || '0')} min={0} max={10000} />
            {compact ? <><hr></hr></> : <GitStatus></GitStatus>}
            {canCommit ? (
              <></>
            ) : (
              <div className="alert alert-warning w-md-25 w-100">
                You are in a detached state.<br></br>
              </div>
            )}
            <ToastContainer position={compact ? "bottom-right" : "top-right"} />
            {compact ?

              <Accordion>
                <CustomToggle eventKey="0">Source control</CustomToggle>
                <Accordion.Collapse eventKey="0">
                  <>
                    <GitControls compact={true} />
                    <CompactExplorer />
                    <hr></hr>
                    <FileTools />
                    <hr></hr>
                  </>
                </Accordion.Collapse>
                <CustomToggle eventKey="1">GitHub</CustomToggle>
                <Accordion.Collapse eventKey="1">
                  <GitHubImporter />
                </Accordion.Collapse>
                <CustomToggle eventKey="3">Log</CustomToggle>
                <Accordion.Collapse eventKey="3">
                  <>
                    <GitLog /><hr></hr>
                  </>
                </Accordion.Collapse>
                <CustomToggle eventKey="2">Branch</CustomToggle>
                <Accordion.Collapse eventKey="2">
                  <>
                    <GitBranch /><hr></hr></>
                </Accordion.Collapse>
                <CustomToggle eventKey="4">IPFS Export</CustomToggle>
                <Accordion.Collapse eventKey="4">
                  <>
                    <IPFSView />
                    <hr></hr>
                    <FileTools />
                  </>
                </Accordion.Collapse>
                <CustomToggle eventKey="5">IPFS Import</CustomToggle>
                <Accordion.Collapse eventKey="5">
                  <Importer />
                </Accordion.Collapse>
                <CustomToggle eventKey="6">IPFS Settings</CustomToggle>
                <Accordion.Collapse eventKey="6">
                  <>
                    <PinataConfig></PinataConfig>
                    <IPFSConfig />
                  </>
                </Accordion.Collapse>

              </Accordion> :

              <></>}
            <FontAwesomeIcon icon={faExclamationTriangle}></FontAwesomeIcon><a className='small pl-2' href='https://github.com/bunsenstraat/remix-storage-plugin/issues' target='_blank'>Submit issues</a>
          </Container>)
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
      Utils.log(error);
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
      Utils.log(error);
    }
  };
  return [storedValue, setValue] as const;
}

export default App;
