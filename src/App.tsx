import React, { useContext, useEffect, useState } from "react";
import "./App.css";
import { Container, ProgressBar, Accordion, AccordionContext, Button, useAccordionToggle } from "react-bootstrap";



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
import { StorageProgress } from "./components/Storage";
import { GitHubSettings } from "./components/github/settings";


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

export const panels: {[key: string]: string} = {
  "0": "sourcecontrol",
  "1": "clone",
  "7": "settings",
  "3": "commits",
  "2": "branches",
  "4": "ipfsexport",
  "5": "ipfsimport",
  "6": "ipssettings",
}

// type of panelNames
export type PanelNames = keyof typeof panels;

function App() {
  const [activePanel, setActivePanel] = useState<string>("0");
  
  const panelChange =  useBehaviorSubject(client.panelChanged)
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
  const [theme, setTheme] = useState("#222336")
  const [highlightColor, setHighlightColor] = useState("text-white")

  gitservice.reponameSubject.subscribe((x) => { }).unsubscribe();
  gitservice.canCommit.subscribe((x) => { }).unsubscribe();
  loaderservice.loading.subscribe((x) => { }).unsubscribe();
  fileservice.canUseApp.subscribe((x) => { }).unsubscribe();

  useEffect(() => {
    Utils.log(window.location.href)
    setCompact(true)
    if (window.location.href.includes('diff')) {
      setDiffViewer(true)
    }
    resetFileSystem(false).then((x) => setCanLoad(x));
  }, []);

  useEffect(() => {
    if (panelChange) {
      console.log('panel change', panelChange)
      setActivePanel(panelChange)
    }
  }, [panelChange]);

  useEffect(() => {
    client.on("theme", "themeChanged", function (theme) {
      if (theme.quality === "dark") {
        setTheme("#222336")
        setHighlightColor('text-white')
      } else {
        setTheme("#FFFFFF")
        setHighlightColor('text-black')
      }
    })

    client.onload().then(async () => {
      client.call('theme', 'currentTheme').then((theme) => {
        if (theme.quality === "dark") {
          setTheme("#222336")
          setHighlightColor('text-white')
        } else {
          setTheme("#FFFFFF")
          setHighlightColor('text-black')
        }
      })
    })

  }, [])

  function CustomToggle(ob: any) {

    const currentEventKey = useContext(AccordionContext);
    const isCurrentEventKey = currentEventKey === ob.eventKey
    console.log(ob)
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
            className={`navbutton ${isCurrentEventKey ? highlightColor : ""}`}
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
              <>
                <Loading loading background={theme} loaderColor="#3498db" />
                <div className="ontop"><StorageProgress update={loading} storageUsed={storageUsed} repoName={repoName} /></div>
              </>
            ) : (
              <></>
            )}
            
            <StorageProgress color={highlightColor}  update={false} storageUsed={storageUsed} repoName={repoName} />
            {compact ? <></> : <GitStatus></GitStatus>}
            {canCommit ? (
              <></>
            ) : (
              <div className="alert alert-warning w-md-25 w-100">
                You are in a detached state.<br></br>
              </div>
            )}
            <ToastContainer position={compact ? "bottom-right" : "top-right"} />
            {compact ?

              <Accordion activeKey={activePanel} defaultActiveKey={activePanel}>
                <CustomToggle eventKey="0">SOURCE CONTROL</CustomToggle>
                <Accordion.Collapse eventKey="0">
                  <>
                    <GitControls compact={true} />
                    <CompactExplorer />
                    <hr></hr>
                    <FileTools />
                    <hr></hr>
                  </>
                </Accordion.Collapse>
                <CustomToggle eventKey="1">CLONE, PUSH, PULL & REMOTES</CustomToggle>
                <Accordion.Collapse eventKey="1">
                  <GitHubImporter client={client} />
                </Accordion.Collapse>
                <CustomToggle eventKey="7">GITHUB SETTINGS</CustomToggle>
                <Accordion.Collapse eventKey="7">
                  <GitHubSettings showOk={true} client={client} />
                </Accordion.Collapse>
                <CustomToggle eventKey="3">COMMITS</CustomToggle>
                <Accordion.Collapse eventKey="3">
                  <>
                    <GitLog /><hr></hr>
                  </>
                </Accordion.Collapse>
                <CustomToggle eventKey="2">BRANCHES</CustomToggle>
                <Accordion.Collapse eventKey="2">
                  <>
                    <GitBranch /><hr></hr></>
                </Accordion.Collapse>
                <CustomToggle eventKey="4">IPFS EXPORT</CustomToggle>
                <Accordion.Collapse eventKey="4">
                  <>
                    <IPFSView />
                    <hr></hr>
                    <FileTools />
                  </>
                </Accordion.Collapse>
                <CustomToggle eventKey="5">IPFS IMPORT</CustomToggle>
                <Accordion.Collapse eventKey="5">
                  <Importer />
                </Accordion.Collapse>
                <CustomToggle eventKey="6">IPFS SETTINGS</CustomToggle>
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
