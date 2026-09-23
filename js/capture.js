document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".js-capture-form").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = form.querySelector("button");
      var original = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Sending…";

      var action = form.getAttribute("action").replace(
        "https://formsubmit.co/",
        "https://formsubmit.co/ajax/"
      );

      fetch(action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      })
        .then(function (res) {
          if (!res.ok) throw new Error("bad response");
          return res.json();
        })
        .then(function () {
          var confirmId = form.getAttribute("data-confirm");
          var confirmEl = confirmId ? document.getElementById(confirmId) : null;
          if (confirmEl) confirmEl.classList.add("show");
          form.style.display = "none";
        })
        .catch(function () {
          btn.disabled = false;
          btn.textContent = original;
        });
    });
  });
});
