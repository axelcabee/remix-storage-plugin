// this slow call will be canceled after 1 second, even if the timeout of someplugin is 10secs.
try {
    setTimeout(() => {
        client.cancel('someplugin', 'slowcall')
    }, 1000)
    await client.call('someplugin', 'slowcall', data);
} catch (e) {
    console.log(e)
}