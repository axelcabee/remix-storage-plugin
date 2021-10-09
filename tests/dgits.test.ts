import { Selector } from 'testcafe';
import { Profile, LocationProfile, ExternalProfile } from '@remixproject/plugin-utils'

fixture`DGIT production tests`
    .page(process.env.TEST_URL)
    .beforeEach( async t => {
        await t.wait(120000).click(Selector('Button').withText('Sure'))
        .click('.introjs-skipbutton')

        await installPlugin(t, {
            name: 'dgittest',
            displayName: 'dgit',
            location: 'sidePanel',
            url: 'http://localhost',
            canActivate: [
                'dGitProvider'
            ]
        })
    });

let hash = '';
let randomInput: string = Math.random().toString()

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
        .click(Selector('.navbutton').withText('Source control'))
        .expect(Selector('[data-id="fileChangesREADME.txt"').exists).ok()
        .click('[data-id="stageAll"]')
        .expect(Selector('[data-id="fileChangesREADME.txt"').exists).notOk()
        .expect(Selector('[data-id="fileStagedREADME.txt"').exists).ok()
        .click(Selector('[data-id="fileStagedREADME.txt"'))
        .typeText('[data-id="commitMessage"]', 'testing')
        .click('[data-id="commitButton"]')
        .click(Selector('.navbutton').withText('Log')).expect(Selector('div').withText('testing').exists).ok()
        .switchToMainWindow()
        .click('[data-id="editorInput"').typeText('.ace_text-input',randomInput).wait(5000)
        .switchToIframe("#plugin-dgittest")
        .click(Selector('.navbutton').withText('Source control'))
        .expect(Selector('[data-id="fileChangesREADME.txt"').exists).ok()
        .click('[data-id="stageAll"]')
        .expect(Selector('[data-id="fileStagedREADME.txt"').exists).ok()
        .typeText('[data-id="commitMessage"]', 'testing2')
        .click('[data-id="commitButton"]')
        .click(Selector('.navbutton').withText('Log')).expect(Selector('div').withText('testing2').exists).ok()
        .click(Selector('.navbutton').withText('IPFS Settings')).click('#btncheckipfs')
        .expect(Selector('#ipfschecksuccess').exists).ok()
        .click(Selector('.navbutton').withText('IPFS Export')).click('#addtocustomipfs')
        .expect(Selector('#ipfshashresult').exists).ok()

    hash = await Selector('#ipfshashresult').getAttribute('data-hash');

    
    console.log('export to', hash)
})

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


test('github import', async t => {
    await t
        .click('#verticalIconsKindpluginManager')
        //.click('[data-id="pluginManagerComponentActivateButtondgittest"]')
        .click('[data-id="verticalIconsKinddgittest"]')
        .switchToIframe("#plugin-dgittest")
        .click(Selector('.navbutton').withText('GitHub'))
        .typeText(Selector('[name="cloneurl"]'), 'https://github.com/bunsenstraat/empty')
        .click('[data-id="clonebtn"]').click(Selector('.btn').withText('Yes'))
        .switchToMainWindow()
        .click('#remember')
        .click(Selector('span').withText('Accept'))
        .click('[data-id="verticalIconsKindfilePanel"')
        .click('[data-id="treeViewLitreeViewItem.git"]')
        .click('[data-id="treeViewLitreeViewItem.git/config"]')
        .expect(Selector('.ace_content').withText('url = https://github.com/bunsenstraat/empty').exists).ok()
})