import express from 'express';
import bodyParser from 'body-parser';
import pg from 'pg';
import axios from 'axios';

const port = 3000;
const app = express();
const db = new pg.Client({
    host: 'localhost',
    user: 'postgres',
    database: 'riotgames',
    password: '123456',
    port: 5432
})
db.connect();

const baseURL = 'https://na1.api.riotgames.com/tft';
const tier = {
    'IV': 4,
    'III': 3,
    'II': 2,
    'I': 1
}
const num_tier = {
    1: 'I',
    2: 'II',
    3: 'III',
    4: 'IV'
}
const boolean = {
    "true": 1,
    "false": 0
}

let matchHistory = [];
//https://americas.api.riotgames.com/tft/match/v1/matches/by-puuid/bIbdSwApyHuBoilm0nXGK2FnTZ9p5vs4pMHcEmT4bDcsPEq4F5uDLH7XQJ-0ajoZ253cp1QqpUMkNw/ids?start=0&count=100

let matchList;
//https://americas.api.riotgames.com/tft/match/v1/matches/${matchID}

const apiKey = 'RGAPI-e01f3793-763b-4ae6-aa27-ad34cb460424';
const myRiotId = "DreadfulTale";
app.get('/', async (req, res) => {
    const resp = await axios.get('https://americas.api.riotgames.com/tft/match/v1/matches/by-puuid/bIbdSwApyHuBoilm0nXGK2FnTZ9p5vs4pMHcEmT4bDcsPEq4F5uDLH7XQJ-0ajoZ253cp1QqpUMkNw/ids?start=0&count=19', {
        headers: {
            "X-Riot-Token": apiKey
        }
    });
    matchList = resp?.data;
    matchList.forEach(async (game) => {
        const resp = await axios.get(`https://americas.api.riotgames.com/tft/match/v1/matches/${game}`, {
            headers: {
                "X-Riot-Token": apiKey
            }
        });

        let gameInfo = {};
        let playerList = resp.data.info.participants;
        const myInfo = playerList.find(player => {
            return player.riotIdGameName === myRiotId;
        })
        gameInfo = {
            gold: myInfo.gold_left,
            round: myInfo.last_round,
            level: myInfo.level,
            placement: myInfo.placement,
            eliminations: myInfo.players_eliminated,
            damage: myInfo.total_damage_to_players,
            win: myInfo.win,
            traits: myInfo.traits,
            units: myInfo.units
        }
        matchHistory.push(myInfo);
    });
    console.log(matchHistory);
    res.render("index.ejs", {matchHistory: matchHistory});
})


app.listen(3000, () => {
    console.log("Server running successfully at port 3000");
})