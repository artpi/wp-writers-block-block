# Writers Block Block

Excited to use GPT-3 in your Gutenberg? Now you can!

## Getting started

For development purposes, this installation covers setting up a development environment as well. **You will need the OpenAI token** - apply [here](https://beta.openai.com/).

1. Make sure you have docker desktop installed
2. You will need npm in version at least 6.
3. Check out this repository
4. `npm install`
5. `npm start` will start WordPress development environment (using `wp-env`) and build appropriate scripts.
6. As I said - you need the GPT-3 token. It's stored in WP-Options, in `openai-token`. Once you have set the above environment, you can set the token via: `./node_modules/.bin/wp-env run cli wp option set openai-token XXXXX`. This command will use wp-cli inside the docker container to set the token option.
7. Now you can access WP-Admin using http://localhost:8888/wp-admin . Login admin, password password.
8. Go to editor, write some content.
9. Once you put the Writers Block BLock, the API request will generate a prompt for you.


== Frequently Asked Questions ==

Not yet.

== Screenshots ==


== Changelog ==

= 0.1.0 =
* Release


