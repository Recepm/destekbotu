const Discord = require("discord.js");
const client = new Discord.Client();

const config = require('./config')

function clean(text) {
    if (typeof(text) === "string")
      return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    else
        return text;
}

var prefix = config.prefix;
var token = config.token;
var chalk = require('chalk');
client.on("ready", () => {
  console.log(chalk.blue("[ " + new Date().toLocaleString() + " ]") + " " + chalk.green("Bot " + client.user.tag + " olarak giriş yaptı, " + client.guilds.size + " kadar sunucuya hizmet veriyorum!"))
  client.user.setActivity(`CodAre Talep Sistemi | ${client.guilds.size} sunucuya hizmet veriyorum! | ${prefix}yardım`);
});

client.on("message", async (msg) => {
  function sahip(owners){
    let string = [];
    for(let x in owners) {
      string.push(client.users.get(owners[x]).tag)
    }
    return string;
  }
  if(msg.author.bot) return;
  if(msg.content.toLowerCase() == "!bilgi" || msg.content.toLowerCase() == "!davet") {
    let inf = sahip(config.sahip)
    let bilgi = new Discord.RichEmbed()
    .setTitle(client.user.username + " hakkında bilgi")
    .setDescription("Botu sunucunuza eklediğiniz anda eğer **Destek Ekibi** isminde bir rol yoksa o rolü oluştururum.\nBotun davet linki: [Tıklayın!](https://discordapp.com/oauth2/authorize?client_id=" + client.user.id + "&scope=bot&permissions=0)\nBotun sahibi: **" + inf.toString().split(",").join(" `|  ` ") + "**")
    .setFooter("ID: " + msg.author.id + " | " + msg.author.tag , msg.author.displayAvatarURL)
    .setColor("#AD4BFF");
    return msg.channel.send({ embed: bilgi })
  } else {
    
  }
})

client.on("guildCreate", (guild) => {
  let destek = guild.roles.find(r => r.name == "Destek Ekibi");
  if(!destek && guild.me.hasPermission("MANAGE_ROLES")) {
    guild.createRole({
      name: "Destek Ekibi",
      permissions: [],
    })
  }
  client.user.setActivity(`CodAre Talep Sistemi | ${client.guilds.size} sunucuya hizmet veriyorum! | ${prefix}yardım`);
});


client.on("message", (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  if (message.content.toLowerCase().startsWith(prefix + `yardım`)) {
    const embed = new Discord.RichEmbed()
    .setTitle(client.user.username + ` talep sistemi! `)
    .setColor(0xCF40FA)
    .setDescription(`Selam, ben ilk olarak CodAre tarafından paylaşıldım!.`)
    .addField(`Talep açma`, `**[${prefix}talepaç]()** : Bir destek talebi oluşturursunuz!\n**[${prefix}talepkapat]()** : Açık olan destek talebinizi kapatır!`)
    .addField(`Diğer`, `**[${prefix}yardım]()** : Yardım menüsünü görürsünüz.\n**[${prefix}ping]()** : Botun ve Discord API'sinin gecikme süresini gösterir.\n**[${prefix}bilgi]()** : Bot hakkında bilgi verir.`)
    .setFooter("ID: " + message.author.id + " | " + message.author.tag , message.author.displayAvatarURL);
    message.channel.send({ embed: embed });
  }

  if (message.content.toLowerCase().startsWith(prefix + `ping`)) {
    message.channel.send(`Hemen gösteriyorum...!`).then(m => {
    m.edit(`Tamamdır, hesapladım :) \Tepki gecikmesi:  **` + (m.createdTimestamp - message.createdTimestamp) + `** ms, Discord API gecikme süresi **` + Math.round(client.ping) + `** ms.`);
    });
}

if (message.content.toLowerCase().startsWith(prefix + `talepaç`)) {
    const reason = message.content.split(" ").slice(1).join(" ");
    if (!message.guild.roles.exists("name", "Destek Ekibi")) return message.channel.send(`Bu Sunucuda '**Destek Ekibi**' rolünü bulamadım bu yüzden talep açamıyorum. \Eğer sunucu sahibi sensen, lütfen **Destek Ekibi** adında bir rol oluştur..`);
    if (message.guild.channels.exists("name", "talep-" + message.author.id)) return message.reply(`zaten hâlihazırda bir destek talebin bulunuyor..`);
    message.guild.createChannel(`talep-${message.author.id}`, "text").then(c => {
        let role = message.guild.roles.find("name", "Destek Ekibi");
        let role2 = message.guild.roles.find("name", "@everyone");
        c.setParent(config.parent)
        c.overwritePermissions(role, {
            SEND_MESSAGES: true,
            READ_MESSAGES: true
        });
        c.overwritePermissions(role2, {
            SEND_MESSAGES: false,
            READ_MESSAGES: false
        });
        c.overwritePermissions(message.author, {
            SEND_MESSAGES: true,
            READ_MESSAGES: true
        });
        message.channel.send(`Talebin oluşturuldu!:` + c);
        const embed = new Discord.RichEmbed()
        .setColor(0xCF40FA)
        .addField(`Hey ${message.author.username}!`, ` talebini başarılı bir şekilde açtım! CodAre tarafından paylaşılmıştır.`)
        .setTimestamp();
        c.send({ embed: embed });
        message.delete();
    }).catch(console.error);
}
if (message.content.toLowerCase().startsWith(prefix + `talepkapat`)) {
    if (!message.channel.name.startsWith(`talep-`)) return;

    message.channel.send(`Destek kanalını kapatacaksın, emin misin? kapatmak için **!kapat** yazman yeterli. Unutma, cevabını **15** saniye içinde vermelisin. CodAre tarafından düzenlenip paylaşıldı!`)
    .then((m) => {
      message.channel.awaitMessages(response => response.content === '-kapat', {
        max: 1,
        time: 15000,
        errors: ['time'],
      })
      .then((collected) => {
          message.channel.delete();
        })
        .catch(() => {
          m.edit('Talebi kapatma isteğin zaman aşımına uğradı.').then(m2 => {
              m2.delete();
          }, 5000);
        });
    });
}

});

client.login(token);
