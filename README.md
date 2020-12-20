# Writers Block Block

Are you stuck with your writing? The next paragraph feels like drudgery and you don't know how to continue?
Writers Block Block uses [GPT-3](https://deliber.at/2020/gpt-3/) to generate the next paragraph for you based on your current content of the post.

## How does it work?

- You write some content
- Insert Writers Block Block block
- It grabs the content of your post, calls OpenAI to generate a completion
- Inserts that completion to your post
- If you like it, you can transform that block into a Paragraph block. If you don't like it - you can delete it.

## Getting started

For development purposes, this installation covers setting up a development environment as well. 

1. **You will need the OpenAI token** - apply [here](https://beta.openai.com/).
2. You will need npm. (Tested with v 6.14)
3. You will need [Docker](https://www.docker.com/products/docker-desktop)
4. Check out this repository
5. `npm install`
6. `npm start` will start WordPress development environment (using `wp-env`) and build appropriate build scripts.
7. Now you can access WP-Admin using http://localhost:8888/wp-admin . Login `admin`, password `password`.
8. Go to editor, write some content.
9.  Use the block editor and search for `Writers Block Block` block. It will prompt for the OpenAI token first time you use it.
10. Profit.

