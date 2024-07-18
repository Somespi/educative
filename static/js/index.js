render_ratio_for('title', 60, { screen_width: 1600, screen_height: 793 });
render_ratio_for('inq', 50, { screen_width: 1600, screen_height: 793 });
render_ratio_for('btn', 60, { screen_width: 1600, screen_height: 793 });
render_ratio_for('select', 60, { screen_width: 1600, screen_height: 793 });
render_ratio_for('input', 60, { screen_width: 1600, screen_height: 793 });
document.getElementById('input').style.height = document.getElementById('btn').clientHeight + 'px';
render_ratio_for('textarea', 131.67, { screen_width: 1600, screen_height: 793 });

document.getElementById('messages').style.maxHeight = document.getElementById('messages').clientHeight + 'px';

function render_ratio_for(id, height, { screen_width, screen_height }) {
    attrs = ['margin-top', 'margin-bottom', 'margin-left', 'margin-right', 'font-size'];
    let element = document.getElementById(id);
    if (!element) return;
    let aspect = Math.min(window.innerHeight / screen_height, window.innerWidth / screen_width);

    attrs.forEach(attr => {
        if (element.computedStyleMap().has(attr))
            element.style[attr] = `${element.computedStyleMap().get(attr).value * aspect}px`;
    });

    element.style.height = `${height * aspect}px`;

}

document.getElementById("form").addEventListener("submit", (event) => {
    event.preventDefault();
    send_message();
});

function send_message() {
    let prompt = document.getElementById('prompt').value;
    if (!prompt) return;
    document.getElementById("messages").innerHTML +=
        `<div class="bg-[rgba(0,0,0,0.05)] message-user message">
        <strong class="text-white text-xs ml-2">user</strong>
        <p class="text-base-content ml-3 text-xs pb-2">${prompt}</p>
    </div>
    `
    fetch("/message", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: prompt })
    })
        .then(response => response.text())
        .then(data => {
            id = Math.random().toString(36).substring(7);
            document.getElementById("messages").innerHTML +=
                `<div class="message message-bot">
                <strong class="text-white text-xs ml-2">bot</strong>
                <p class="text-base-content ml-3 text-xs pb-2" id="${id}" ></p>
            </div>
            `
            let timeout = 1;

            for (let i = 0; i < data.length; i++) {
                setTimeout(() => {
                    document.getElementById(id).innerHTML += data.charAt(i);
                }, (timeout++) * 15)
            }

        })
        .catch(error => console.error('Error:', error));
}


function send_request() {
    let circle = document.getElementById('circle');
    document.getElementById("main_page").style.display = "none";
    document.getElementById("loading").style.display = "flex";
    circle.style.width = `${circle.clientHeight}px`;
    fetch("/generate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ topic: document.getElementById('input').value, grade_level: document.getElementById('select').value, notes: document.getElementById('textarea').value })
    })
        .then(response => response.text())
        .then(data => {

            var converter = new showdown.Converter();

            converter.setFlavor('github');
            html = converter.makeHtml(data);
            console.log(html)
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            function addPadding(element, padding) {
                if (element.tagName === 'UL') {
                    element.querySelectorAll('li').forEach((li) => li.style.paddingLeft = (padding * 3) + 'px');
                }
                element.querySelectorAll('ul').forEach((ul) => addPadding(ul, ++padding));
            }

            addPadding(doc, 1);

            doc.body.children[0].style.fontSize = "1.4em";
            doc.body.children[0].style.fontWeight = "900";
            const serializer = new XMLSerializer();
            const newHtmlText = serializer.serializeToString(doc.body);
            const finalHtml = newHtmlText.substring(newHtmlText.indexOf('<body>') + 44, newHtmlText.indexOf('</body>'));
            document.getElementById("loading").style.display = "none";
            document.getElementById("main_page").style.display = "block";
            document.getElementById("main_page").style.overflowY = "auto";
            document.getElementById("main_page").style.fontSize = "80%";
            document.getElementById("main_page").style.lineHeight = "1.8em";
            document.getElementById("main_page").style.padding = "1.7em";
            document.getElementById("main_page").innerHTML = finalHtml;
        })
        .then(data => console.log(data))
        .catch(error => {
            alert('Error:', error)
            console.log(error)
});



}