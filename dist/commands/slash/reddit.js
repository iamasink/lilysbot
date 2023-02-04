"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { redditu, redditpw, redditappId, redditappSecret } = require('../../config.json');
const snoowrap = require('snoowrap');
const { request } = require('undici');
const format = require('../../structure/format');
// Alternatively, just pass in a username and password for script-type apps.
const reddit = new snoowrap({
    userAgent: 'Lilysbot',
    clientId: redditappId,
    clientSecret: redditappSecret,
    username: redditu,
    password: redditpw
});
exports.default = {
    data: new SlashCommandBuilder()
        .setName('reddit')
        .setDescription('reddit')
        .addStringOption((option) => option
        .setName('subreddit')
        .setDescription('Subreddit to retrieve image from')
        .setRequired(true))
        .addStringOption((option) => option
        .setName('sort')
        .setDescription('Sort by')
        .addChoices({ name: 'Top', value: 'gif_funny' }))
        .addIntegerOption((option) => option
        .setName('number')
        .setDescription(`Number of images`)
        .setMinValue(1)
        .setMaxValue(100))
        .addIntegerOption((option) => option
        .setName('delay')
        .setDescription(`Number of seconds to wait before sending next image. No effect if number = 1. Default is 5 seconds`)
        .setMinValue(5)
        .setMaxValue(60))
        .addBooleanOption((option) => option
        .setName('images')
        .setDescription('Allow non images')),
    async execute(interaction) {
        const onlyImages = interaction.options.getBoolean('images') || true;
        await interaction.deferReply();
        let subreddit = interaction.options.getString('subreddit');
        if (subreddit[1] === `/`)
            subreddit = subreddit.slice(2);
        const number = interaction.options.getInteger('number') || 1;
        for (let i = 0; i < number; i++) {
            let url = ``;
            let link = ``;
            let count = 0;
            setTimeout(async function () {
                let res;
                while (onlyImages && url == link && count < 15) {
                    let sub = await reddit.getSubreddit(subreddit);
                    res = await sub.getRandomSubmission();
                    console.log(`reddit: ${JSON.stringify(res)}`);
                    console.log(`sub: ${JSON.stringify(sub)}`);
                    console.log(res.url);
                    link = `https://www.reddit.com${res.permalink}`;
                    url = res.url;
                    // if (url != link) {
                    // 	i = `\nImage: ${res.url}`
                    // }
                    count++;
                }
                const result = await request(`https://www.reddit.com/r/${subreddit}/about.json`);
                //const image = await getJSONResponse(result.body)
                const body = await format.getJSONResponse(result.body);
                const image = body.data.icon_img || `https://www.redditinc.com/assets/images/site/reddit-logo.png`;
                const embed = new EmbedBuilder()
                    .setTitle(`image!`)
                    .setColor(`#f9beca`)
                    .setDescription(`Link: https://www.reddit.com${res.permalink}${i}\nScore: ${res.score}`)
                    .setImage(res.url)
                    .setFooter({ text: `Image from reddit.com/r/${subreddit.toLowerCase()}/`, iconURL: image });
                if (i == 0)
                    await interaction.editReply({ embeds: [embed] });
                else
                    await interaction.followUp({ embeds: [embed] });
            }, i * interaction.options.getInteger('delay') * 1000);
        } //
    },
};
