# Text Reader Using Google Cloud Text-to-speech
A text reader that uses Google Cloud Text-to-speech Wavenet voices to synthesize speeches.
---------
This project is designed to make English listening audio for English learners in China, but it can also serve other purposes.
Google uses groundbreaking research in speech synthesis (WaveNet) and Google's powerful neural networks to deliver high-fidelity audio, which is much better than what is commonly used to make English listening audio for English learners in China at present.

## Features
+ Uses Google Cloud Text-to-speech Wavenet voices to synthesize
+ Partial SSML support, including the `<voice>` tag that is not supported by Google. This project will handle this tag for you.
+ Friendly SSML editor. You don't need to type the tags yourself.
+ Dialog Maker to help you transform speaker indicators like "Tony:", "Betty:", etc. to the `<voice>` tags so that these lines will be read by desired voices.
+ Automatically detects lines written in Chinese and have them read by a Chinese voice so that you won't have to manually insert the `<voice>` tags.
+ Export the speech to WAV files.

## How to use
1. Clone this repo. Place it somewhere that can run PHP and reach Google.
    NOTE FOR USERS IN MAINLAND CHINA / 中国大陆用户请注意：本项目使用了Google服务，请确保您运行PHP的服务器可以访问Google。
2. Follow [Google's guide](https://cloud.google.com/text-to-speech/docs/quickstart-client-libraries#before-you-begin) to Step 4 and obtain your key file.
3. Place your key file on your server. Edit `config.php` and replace `/path/to/your/key.json` with the path to your key file.
4. Follow [Google's guide](https://cloud.google.com/text-to-speech/docs/quickstart-client-libraries#install_the_client_library) to install Google Cloud's client library for PHP for text-to-speech. Be sure to run the `composer` command in the directory where you place this repo. Furthermore, this client library for PHP requires the extension `ext-bcmath`, be sure to have it installed.
5. Enjoy!

This project uses [Google Cloud Services](https://cloud.google.com/text-to-speech/), [jQuery](https://www.jquery.com/), [audiobuffer-to-wav.js](https://github.com/Jam3/audiobuffer-to-wav).
