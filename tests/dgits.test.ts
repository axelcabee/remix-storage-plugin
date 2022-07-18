import { Selector, RequestLogger } from 'testcafe';
import { Profile, LocationProfile, ExternalProfile } from '@remixproject/plugin-utils'

const logger = RequestLogger();

fixture`DGIT production tests`
    .page(process.env.TEST_URL)
    .beforeEach( async t => {

        // exists doesn't wait with timeouts, this is a hack but it works, it will wait for buttons to appear  
        // https://testcafe.io/documentation/402829/guides/basic-guides/select-page-elements#selector-timeout      
        await Selector('Button',{timeout:120000}).innerText
        if(await Selector('Button').withText('Accept').exists){
            await t.click(Selector('Button').withText('Accept'))
        }
        await t.click('.introjs-skipbutton')

        await installPlugin(t, {
            name: 'dgittest',
            displayName: 'dgit',
            location: 'sidePanel',
            url: 'http://localhost:3000',
            canActivate: [
                'dGitProvider'
            ]
        })
    });

let hash = '';
let randomInput: string = Math.random().toString()

const openPlugin = async(t: TestController, plugin: string) => {
    await t.click(`#icon-panel div[plugin="${plugin}"]`)
}

const installPlugin = async(t: TestController, profile: Profile & LocationProfile & ExternalProfile) =>{
    await t.click('*[plugin="pluginManager"]')
    .click(`*[data-id="pluginManagerComponentPluginSearchButton`)
    //cy.get(`*[data-id="pluginManagerLocalPluginModalDialogModalDialogModalTitle-react`).should('be.visible')
    .typeText(`*[data-id="localPluginName`, profile.name)
    .typeText(`*[data-id="localPluginDisplayName`, profile.displayName)
    .typeText(`*[data-id="localPluginUrl`, profile.url)
    .typeText(`*[data-id="localPluginCanActivate`, profile.canActivate && profile.canActivate.join(','))
    .click(`*[data-id="pluginManagerLocalPluginModalDialog-modal-footer-ok-react"`).click('*[plugin="pluginManager"]')
}

test('stage files and export', async t => {
    await t 
        .click('#verticalIconsKindpluginManager')
        //.click('[data-id="pluginManagerComponentActivateButtondgittest"]')
        .click('[data-id="verticalIconsKinddgittest"]')
        .switchToIframe("#plugin-dgittest")
        .click(Selector('.navbutton').withText('SOURCE CONTROL'))
        .expect(Selector('[data-id="fileChangesREADME.txt"').exists).ok()
        .click('[data-id="stageAll"]')
        .expect(Selector('[data-id="fileChangesREADME.txt"').exists).notOk()
        .expect(Selector('[data-id="fileStagedREADME.txt"').exists).ok()
        .click(Selector('[data-id="fileStagedREADME.txt"'))
        .typeText('[data-id="commitMessage"]', 'testing')
        .click('[data-id="commitButton"]')
        .click(Selector('.navbutton').withText('COMMITS')).expect(Selector('div').withText('testing').exists).ok()
        .switchToMainWindow()
        .click('[data-id="editorInput"').typeText('.ace_text-input',randomInput).wait(5000)
        .switchToIframe("#plugin-dgittest")
        .click(Selector('.navbutton').withText('SOURCE CONTROL'))
        .expect(Selector('[data-id="fileChangesREADME.txt"').exists).ok()
        .click('[data-id="stageAll"]')
        .expect(Selector('[data-id="fileStagedREADME.txt"').exists).ok()
        .typeText('[data-id="commitMessage"]', 'testing2')
        .click('[data-id="commitButton"]')
        .click(Selector('.navbutton').withText('COMMITS')).expect(Selector('div').withText('testing2').exists).ok()
        //.click(Selector('.navbutton').withText('IPFS Settings')).click('#btncheckipfs')
        //.expect(Selector('#ipfschecksuccess').exists).ok()
        //.click(Selector('.navbutton').withText('IPFS Export')).click('#addtocustomipfs')
        //.expect(Selector('#ipfshashresult').exists).ok()

    //hash = await Selector('#ipfshashresult').getAttribute('data-hash');
    //await t.expect(hash && hash !== '' && hash !== undefined).ok()
    
    //console.log('export to', hash)
})

test('detect file added', async t => {
    await openPlugin(t, 'filePanel')
    await t.click('*[data-id="fileExplorerNewFilecreateNewFile"]')
    .typeText('*[data-id$="/blank"] .remixui_items',`addedfile.sol`).pressKey('enter')
    .click('#verticalIconsKindpluginManager')
    .click('[data-id="verticalIconsKinddgittest"]')
    .switchToIframe("#plugin-dgittest")
    .click(Selector('.navbutton').withText('SOURCE CONTROL')).wait(1)
    .expect(Selector('[data-id="fileChangesaddedfile.sol"').exists).ok()
})

/*
test('import with hash', async t => {
    console.log('import ', hash)

    await t
        .click('#verticalIconsKindpluginManager')
        //.click('[data-id="pluginManagerComponentActivateButtondgittest"]')
        .click('[data-id="verticalIconsKinddgittest"]')
        .switchToIframe("#plugin-dgittest")
        .click(Selector('.navbutton').withText('IPFS Import'))
        .typeText('#ipfshash', hash)
        .expect(Selector('#clone-btn').hasAttribute('disabled')).notOk()
        .click('#clone-btn')
        .click(Selector('.btn').withText('Yes'))
        .switchToMainWindow()
        .click('#remember')
        .click(Selector('span').withText('Accept'))
        .click('[data-id="verticalIconsKindfilePanel"')
        .click('[data-id="treeViewLitreeViewItemREADME.txt"')
        .expect(Selector('.ace_content').withText(randomInput).exists).ok()
})
*/

/* test.only('selected workspace', async t=>{
    await t.click('[data-id="verticalIconsKindfilePanel"')
    let workspace = await Selector('#workspacesSelect').value
    console.log(workspace)
    await t.expect(workspace.includes('default_')).ok()
})
 */

test('github import', async t => {
    await t
        .click('#verticalIconsKindpluginManager')
        //.click('[data-id="pluginManagerComponentActivateButtondgittest"]')
        .click('[data-id="verticalIconsKinddgittest"]')
        .switchToIframe("#plugin-dgittest")
        .click(Selector('.navbutton').withText('CLONE'))
        .typeText(Selector('[name="cloneurl"]'), 'https://github.com/bunsenstraat/empty')
        .click('[data-id="clonebtn"]').click(Selector('.btn').withText('Yes'))
        .switchToMainWindow()
        .click('#remember')
        .click(Selector('span').withText('Accept'))
        .click('[data-id="verticalIconsKindfilePanel"')
        .click('[data-id="treeViewLitreeViewItem.git"]')
        .click('[data-id="treeViewLitreeViewItem.git/config"]')
        .expect(Selector('.ace_content').withText('url = https://github.com/bunsenstraat/empty').exists).ok()
    await t.click('[data-id="verticalIconsKindfilePanel"')
    const workspace = await Selector('#workspacesSelect').value
    await t.expect(workspace?.includes('workspace_')).ok()
})