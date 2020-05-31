
const ghpages = require('gh-pages');

ghpages.publish(
    '__sapper__/export',
    {
        branch: 'master',
        repo: 'JakobJK.github.io',
        user: {
            name: 'JakobJK',
            email: 'jakobjk@gmail.com'
        }
    },
    () => {
        console.log('Deploy Complete!')
    }
)