import express from "express";
import bodyParser from "body-parser";
import fetch from 'node-fetch';
import { dirname } from "path";
import path from "path"
import { fileURLToPath } from "url";
import { ElevenLabsClient, ElevenLabs,play }  from 'elevenlabs'
import fs  from 'fs';
import WaveSurfer from 'wavesurfer.js'
import EnvelopePlugin from 'wavesurfer.js/dist/plugins/envelope.esm.js'
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(express.static('public'));

// Configura o EJS como motor de visualização
app.set('view engine', 'ejs');



// app.get('/', (req, res) => {
//     res.sendFile(__dirname + "/public/index.html");
// });

app.get('/', (req, res) => {
    res.render('index.ejs', { title: 'Web Audio Studio' });
});

app.get('/samples', (req, res) => {
    res.render('samples.ejs', { title: 'Samples' });
});

app.get('/studio', (req, res) => {
    res.render('studio.ejs', { title: 'Studio' });
});

app.get('/contact', (req, res) => {
    res.render('contact.ejs', { title: 'Web Audio Studio' });
});

app.get('spot-machine_v2/templates', (req, res) => {
    res.render('index.html', { title: 'Audio Mixer' });
});

app.get('/about', (req, res) => {
    res.render('about.ejs', { title: 'Web Audio Studio' });
});

app.use(express.json());

app.post('/generateAudio', async (req, res) => {
    const { text, voice,stability, similarity, sty } = req.body;
    console.log(stability,similarity,sty, voice);
    
    const apiKey = ''; // Substitua pela sua chave da API da Eleven Labs
    // const url = 'https://api.elevenlabs.io/v1/text-to-speech';
    const client = new ElevenLabsClient({ apiKey: "" });
    const voices = await client.voices.getAll();
     console.log(voices);
    // const audio = await client.textToSpeech.convert("pMsXgVXv3BLzUgSXRplE", {
    
    const audio = await client.generate({    
    optimize_streaming_latency: ElevenLabs.OptimizeStreamingLatency.Zero,
    output_format: ElevenLabs.OutputFormat.Mp344100128,
    voice: voice,
    text: text,
    model_id: "eleven_multilingual_v2",
    
    // text: "It sure does, Jackie\u2026 My mama always said: \u201CIn Carolina, the air's so thick you can wear it!\u201D",
    voice_settings: {
        stability: stability,
        similarity_boost: similarity,
        style: sty
    }

   
});
//await play(audio);
//console.log(voices);
const CHUNK_SIZE = 1024;

async function streamToBuffer(stream) {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks);
}

async function saveAudioToFile(audioStream) {
    try {
        const audioBuffer = await streamToBuffer(audioStream);
        fs.writeFile(__dirname + '/public/audios/output.mp3', audioBuffer, (err) => {
            if (err) {
                console.error('Erro ao salvar o arquivo MP3:', err);
                return;
            }
            console.log('Arquivo MP3 salvo com sucesso!');
            res.json({ audioUrl: ('audios/output.mp3') });
        });
    } catch (error) {
        console.error('Erro:', error);
    }
}

await saveAudioToFile(audio);
// const CHUNK_SIZE = 1024;

// const fileStream = fs.createWriteStream('output.mp3');
// audio.pipe(fileStream);

    

//  fileStream.on('finish', () => {
//     console.log('Audio saved successfully as output.mp3');
// });

// fileStream.on('error', (error) => {
//     console.error('Error writing to file:', error);
// });


});

// Inicia o servidor
const port = 8080;
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});




