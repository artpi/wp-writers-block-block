=== Coauthor - AI Writing Assistant and Artist ===
Contributors:      artpi
Tags:              block, openai, gpt3, ai, dalle
Requires at least: 5.3.1
Tested up to:      6.1.1
Stable tag:        0.3.5
Requires PHP:      7.0.0
License:           GPL-2.0-or-later
License URI:       https://www.gnu.org/licenses/gpl-2.0.html


Coauthor helps you write with GPT-3 and illustrate your posts with DALL-e. You will need an OpenAI token to use this block.

== Description ==

Coauthor brings the power of AI to help you focus on your best writing:
- Coauthor Paragraph completes your post using GPT-3
- Coauthor Image lets you conjure beautiful images painted by AI

GPT-3 is a text-completion algorithm developed by OpenAI - [read more here](https://deliber.at/2020/gpt-3/).
It can generate text using a provided sample. And so - it can help you get out of the writer's block!

== Installation ==

1. Get OpenAI API token from [here](https://openai.com/blog/openai-api/)
1. Install this plugin, activate
1. Go to the block editor, write some content
1. Search for "Coauthor Paragraph" block, insert into your content
1. First time you use it, it will ask you for the OpenAI token
1. When you submit the token or use it next time - it will auto-complete the writing for you.

== How does it work ==

=== Coauthor Paragraph ===

* You write some content
* Insert `Coauthor Paragraph` block into your post
* It grabs the content of your post, calls OpenAI to generate a completion
* Inserts that completion to your post
* If you like it, you can transform that block into a Paragraph block. If you don't like it - you can delete it.
* This plugin is automatically limiting the requests to one per 60s to protect your OpenAI quota. If you call the suggestion endpoint in succession, you will get the same answer.

=== Coauthor Image ===

* Insert `Coauthor Image` block into your post
* Fill in the prompt to generate an image you would like to see
* It calls OpenAI api to generate 4 images
* You choose one that you like best
* That image gets uploaded to your media gallery and inserted into your post
* Image generations are cached for a month. If you ask for images using the same prompt, you will get the same result.

== Frequently Asked Questions ==

= Can I use this block without access to GPT-3 API? =

No.

= What is GPT-3? =

In July of 2020, Open AI foundation has opened private, beta API access to their newest machine learning model: GPT-3.
It’s a text prediction tool that is trained on pretty much the entirety of the Internet.
You give it a sample and it suggests the text to complete that sample.
I've written more [here](https://deliber.at/2020/gpt-3/).


= Is GPT-3 access paid? =

Yes, it is. You can sign up for a trial [here](https://openai.com/blog/openai-api/), but you have to pay to use this API.
Current pricing is about $0.06 for 4 000 characters. Both prompt and response are included in that pricing, so for example:
If you have written 500 characters, you will get a response with 250 characters (I have limited it so).
You will pay about $0.011 for that use.

= That does not seem much, but how can I be protected from accidental usage? =

I have limited the API calls to one per minute. That means, that you will never pay more than $17 per day.

== Screenshots ==

1. Auto-completed poetry with Coauthor Paragraph
2. Coauthor Image showing image selection

== Changelog ==

= 0.1.0 =

* Release

= 0.1.1 =

* Fix WP Version preventing installation on WP 5.6

= 0.3.1 =

* Rename to Coauthor
* Introduce another block - Coauthor Image to generate images using DALL-e