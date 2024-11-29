require('dotenv').config();
const {Octokit} = require('@octokit/rest');
const {user_record, user_account} = require('NeteaseCloudMusicApi');
const axios = require('axios').default;
const fs = require('fs');

async function getBase64(url) {
    const response = await axios.get(url, {responseType: 'arraybuffer'});
    return Buffer.from(response.data, 'binary').toString('base64');
}

const {
    GH_TOKEN,
    USER_ID,
    USER_TOKEN,
    AUTHOR,
    REPO
} = process.env;

(async () => {
    try {
        const account = await user_account({
            cookie: `MUSIC_U=${USER_TOKEN}`,
        });

        if (!account.body.profile) {
            throw new Error('无法获取用户信息，请检查 USER_TOKEN 是否有效');
        }

        const username = account.body.profile.nickname;
        const avatarUrl = account.body.profile.avatarUrl + "?param=128y128"; // 压缩

        const record = await user_record({
            cookie: `MUSIC_U=${USER_TOKEN}`,
            uid: USER_ID,
            type: 1,
        }).catch(error => console.error(`无法获取用户播放记录 \n${error}`));

        if (!record || !record.body || !record.body.weekData) {
            throw new Error('无法获取播放记录，请检查 USER_ID 和 USER_TOKEN 是否有效');
        }

        const content = record.body;
        const topSongs = content.weekData.slice(0, 5); // 获取前五首歌

        let songsData = [];
        for (let index = 0; index < topSongs.length; index++) {
            const song = topSongs[index];

            const songName = song?.song?.name || '未知歌曲';
            if (songName === '未知歌曲') {
                console.error(`无法访问歌曲名称，歌曲数据：${JSON.stringify(song)}`);
            }

            const songId = song?.song?.id + '';
            const songAuthorArray = song?.song?.ar || [];
            const songAuthors = songAuthorArray.map(i => i.name).join(' / ');
            const playCount = song?.playCount || 0;
            const songCoverUrl = song?.song?.al?.picUrl + "?param=100y100"; // 小封面

            songsData.push({rank: index + 1, songId, songName, songAuthors, playCount, songCoverUrl});
        }

        let svgContent = "";
        try {
            // 生成SVG内容
            svgContent = Buffer.from(
                `<svg width="450" height="${20 + 100 * songsData.length}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                    <foreignObject width="450" height="520">
                        <div xmlns="http://www.w3.org/1999/xhtml" class="container" style="padding: 5px; text-align: left;">
                        <style>
                            * {
                                box-sizing: border-box;
                                color: black;
                                font-size: 14px;
                                font-family: 'PingFang SC', 'Helvetica Neue', 'Segoe UI', 'Microsoft YaHei', sans-serif !important;
                            }
                            .card {
                                text-align: left;
                                display: flex;
                                flex-direction: column;
                                width: 450px;
                                margin: 0 auto;
                                gap: 20px;
                                overflow: hidden;
                                padding: 10px;
                            }
                            .user {
                                text-align: left;
                                margin-bottom: 15px;
                            }
                            .avatar {
                                width: 32px;
                                height: 32px;
                                border-radius: 100%;
                                vertical-align: middle;
                            }
                            .username {
                                line-height: 32px;
                                vertical-align: middle;
                                font-size: 16px;
                                margin-left: 5px;
                            }
                            .song-list {
                                margin-top: 10px;
                            }
                            .song-item {
                                position: relative;
                                display: flex;
                                align-items: center;
                                margin-bottom: 20px;
                                justify-content: space-between;
                            }
                            .song-cover {
                                width: 50px;
                                height: 50px;
                                border-radius: 5px;
                                margin-right: 10px;
                            }
                            .song-rank {
                                font-size: 16px;
                                font-weight: bold;
                                margin-right: 10px;
                                width: 20px;
                                text-align: left;
                            }
                            .song-info {
                                font-size: 14px;
                                display: flex;
                                flex-direction: column;
                                gap: 5px;
                                flex-grow: 1;
                            }
                            .song-title {
                                font-weight: bold;
                                overflow: hidden;
                                white-space: nowrap;
                                text-overflow: ellipsis;
                                width: 130px;
                                margin-bottom: 4px;
                            }
                            .song-authors {
                                opacity: 0.7;
                                font-size: 12px;
                            }
                            .song-playcount {
                                font-size: 12px;
                                margin-left: auto;
                                margin-right: 10px;
                                text-align: left;
                            }
                        </style>
                            <div class="card">
                                <div class="user">
                                    <img class="avatar" src="data:image/jpg;base64,${await getBase64(avatarUrl)}"/>
                                    <a class="username"> ${username} </a>
                                </div>
                                <div class="song-list">
                                    ${await Promise.all(songsData.map(async (song) => `
                                        <div class="song-item">
                                            <div class="song-rank">${song.rank}</div>
                                            <img class="song-cover" src="data:image/jpg;base64,${await getBase64(song.songCoverUrl)}"/>
                                            <div class="song-info">
                                                <div class="song-title">${song.songName}</div>
                                                <div class="song-authors">${song.songAuthors}</div>
                                            </div>
                                            <div class="song-playcount">播放次数：${song.playCount}</div>
                                        </div>
                                    `)).then(items => items.join(''))}
                                </div>
                            </div>
                        </div>
                    </foreignObject>
                </svg>
                `
            ).toString("base64");
        } catch (err) {
            console.error(`处理 SVG 时发生了错误：${err}`);
        }
        // 将 svgContent 保存到本地
        fs.writeFileSync('card.svg', Buffer.from(svgContent, 'base64'));

        // 生成深色模式的 SVG
        let svgContentDark = Buffer.from(
            `<svg width="450" height="${20 + 100 * songsData.length}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                <foreignObject width="450" height="520">
                    <div xmlns="http://www.w3.org/1999/xhtml" class="container" style="padding: 5px; text-align: left; background-color: #1e1e1e; color: #ffffff;">
                    <style>
                        * {
                            box-sizing: border-box;
                            color: #ffffff;
                            font-size: 14px;
                            font-family: 'PingFang SC', 'Helvetica Neue', 'Segoe UI', 'Microsoft YaHei', sans-serif !important;
                        }
                        .card {
                            text-align: left;
                            display: flex;
                            flex-direction: column;
                            width: 450px;
                            margin: 0 auto;
                            gap: 20px;
                            overflow: hidden;
                            padding: 10px;
                            background-color: #2b2b2b;
                            border: 1px solid #444;
                        }
                        .user {
                            text-align: left;
                            margin-bottom: 15px;
                        }
                        .avatar {
                            width: 32px;
                            height: 32px;
                            border-radius: 100%;
                            vertical-align: middle;
                        }
                        .username {
                            line-height: 32px;
                            vertical-align: middle;
                            font-size: 16px;
                            margin-left: 5px;
                            color: #ffffff;
                        }
                        .song-list {
                            margin-top: 10px;
                        }
                        .song-item {
                            position: relative;
                            display: flex;
                            align-items: center;
                            margin-bottom: 20px;
                            justify-content: space-between;
                        }
                        .song-cover {
                            width: 50px;
                            height: 50px;
                            border-radius: 5px;
                            margin-right: 10px;
                        }
                        .song-rank {
                            font-size: 16px;
                            font-weight: bold;
                            margin-right: 10px;
                            width: 20px;
                            text-align: left;
                            color: #ffffff;
                        }
                        .song-info {
                            font-size: 14px;
                            display: flex;
                            flex-direction: column;
                            gap: 5px;
                            flex-grow: 1;
                            color: #ffffff;
                        }
                        .song-title {
                            font-weight: bold;
                            overflow: hidden;
                            white-space: nowrap;
                            text-overflow: ellipsis;
                            width: 130px;
                            margin-bottom: 4px;
                            color: #ffffff;
                        }
                        .song-authors {
                            opacity: 0.7;
                            font-size: 12px;
                            color: #d3d3d3;
                        }
                        .song-playcount {
                            font-size: 12px;
                            margin-left: auto;
                            margin-right: 10px;
                            text-align: left;
                            color: #d3d3d3;
                        }
                    </style>
                        <div class="card">
                            <div class="user">
                                <img class="avatar" src="data:image/jpg;base64,${await getBase64(avatarUrl)}"/>
                                <a class="username"> ${username} </a>
                            </div>
                            <div class="song-list">
                                ${await Promise.all(songsData.map(async (song) => `
                                    <div class="song-item">
                                        <div class="song-rank">${song.rank}</div>
                                        <img class="song-cover" src="data:image/jpg;base64,${await getBase64(song.songCoverUrl)}"/>
                                        <div class="song-info">
                                            <div class="song-title">${song.songName}</div>
                                            <div class="song-authors">${song.songAuthors}</div>
                                        </div>
                                        <div class="song-playcount">播放次数：${song.playCount}</div>
                                    </div>
                                `)).then(items => items.join(''))}
                            </div>
                        </div>
                    </div>
                </foreignObject>
            </svg>
            `
        ).toString("base64");
        fs.writeFileSync('card-dark.svg', Buffer.from(svgContentDark, 'base64'));

        // 上传代码到 GitHub
        const octokit = new Octokit({
            auth: GH_TOKEN,
        });

        const {
            data: {sha: svgSha}
        } = await octokit.git.createBlob({
            owner: AUTHOR,
            repo: REPO,
            content: svgContent,
            encoding: "base64"
        });

        const {
            data: {sha: svgDarkSha}
        } = await octokit.git.createBlob({
            owner: AUTHOR,
            repo: REPO,
            content: svgContentDark,
            encoding: "base64"
        });

        const commits = await octokit.repos.listCommits({
            owner: AUTHOR,
            repo: REPO,
        });
        const lastSha = commits.data[0].sha;

        const {
            data: {sha: treeSHA}
        } = await octokit.git.createTree({
            owner: AUTHOR,
            repo: REPO,
            tree: [
                {
                    mode: '100644',
                    path: "card.svg",
                    type: "blob",
                    sha: svgSha
                },
                {
                    mode: '100644',
                    path: "card-dark.svg",
                    type: "blob",
                    sha: svgDarkSha
                }
            ],
            base_tree: lastSha,
        });

        const {
            data: {sha: newSHA}
        } = await octokit.git.createCommit({
            owner: AUTHOR,
            repo: REPO,
            author: {
                name: "github-actions[bot]",
                email: "41898282+github-actions[bot]@users.noreply.github.com",
            },
            committer: {
                name: "github-actions[bot]",
                email: "41898282+github-actions[bot]@users.noreply.github.com",
            },
            tree: treeSHA,
            message: '每日更新SVG文件',
            parents: [lastSha],
        });

        const result = await octokit.git.updateRef({
            owner: AUTHOR,
            repo: REPO,
            ref: "heads/master",
            sha: newSHA,
        });
        console.log(result);

        console.log('SVG 文件已生成并上传到 GitHub');
    } catch (error) {
        console.error(`上传GitHub执行过程中发生错误：${error.message}`);
    }
})();
