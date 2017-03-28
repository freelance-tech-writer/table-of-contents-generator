/**
 * index.js
 */

function anchor(headline) {
	return headline.match(/href=\"([^\"]+?)\"/)[1];
}

function headingText(headline) {
	return headline.match(/a>(.*)<\/h/)[1];
}

function spacesPlusBullet(level, bullet) {
	var output = '';
	var delimiter = "*"

	if (bullet == "num") {
		delimiter = "1.";
	}

	for (var i = 1; i < (level - 1) * 4; i++) {
		output += ' ';
	}
	return output + delimiter + ' ';
}

function getHeadingLevel(headline) {
	return parseInt(headline.substr(-1), 10);
}

function removeCodeTags(workingOutput) {
	workingOutput.replace(/<code>/g, '');
	return workingOutput.replace(/<\/code>/g, '');
}

function selectHeadlines(workingOutput) {
	return workingOutput.match(/<a\s*id="user-content-[^"]*".*<\/h[1-6]/g);
}

function stitchMultilineHeadlines(rawHTML) {
	return rawHTML.replace(/\n<\/h/g, '</h');
}

function generateTOC(rawHTML) {
	var headingLines = '';
	var bullet = '*';

	var workingOutput = stitchMultilineHeadlines(rawHTML);

	workingOutput = removeCodeTags(workingOutput);
	workingOutput = selectHeadlines(workingOutput);

	workingOutput.forEach(function(headline) {
		var level = getHeadingLevel(headline);
		var tocLine = spacesPlusBullet(level, $("input[name=bullet]:checked")
			.attr("id"));

		tocLine += '[' + headingText(headline) + ']';
		tocLine += '(' + anchor(headline) + ')';

		headingLines += tocLine + '\n';
	});

	return headingLines;
}

function runGenerator(input) {
	$.ajax({
			method: "POST",
			url: "https://api.github.com/markdown",
			dataType: "json",
			data: JSON.stringify({
				text: input
			}, null, 2)
		})
		.always(function(response) {
			$('#js-output')
				.val(
					'# Table of Contents\n' +
					generateTOC(response.responseText)
				);
		});
}

$(document).ready(function() {
	$('#js-runGenerator')
		.click(function() {
			runGenerator($('#js-textarea').val());
		});
});
