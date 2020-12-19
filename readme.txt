=== Writers Block Block ===
Contributors:      @artpi
Tags:              block, openai, gpt-3, writing
Requires at least: 5.6.0
Tested up to:      5.6.0
Stable tag:        0.1.0
Requires PHP:      7.0.0
License:           GPL-2.0-or-later
License URI:       https://www.gnu.org/licenses/gpl-2.0.html

A block generating writing prompts using OpenAI's GPT-3

== Description ==

Excited to use GPT-3 in your Gutenberg? Now you can!

== Installation ==

For development purposes, this installation covers setting up a development environment as well. **You will need the OpenAI token**.

1. Make sure you have docker desktop installed
1. You will need npm in version at least 6.
1. Check out this repository
1. `npm install`
1. `npm start` will start WordPress development environment (using `wp-env`) and build appropriate scripts.
1. As I said - you need the GPT-3 token. It's stored in WP-Options, in `openai-token`. Once you have set the above environment, you can set the token via: `./node_modules/.bin/wp-env run cli wp option set openai-token XXXXX`. This command will use wp-cli inside the docker container to set the token option.
1. Now you can access WP-Admin using http://localhost:8888/wp-admin . Login admin, password password.
1. Go to editor, write some content.
1. Once you put the Writers Block BLock, the API request will generate a prompt for you.


== Frequently Asked Questions ==

Not yet.

== Screenshots ==


== Changelog ==

= 0.1.0 =
* Release


