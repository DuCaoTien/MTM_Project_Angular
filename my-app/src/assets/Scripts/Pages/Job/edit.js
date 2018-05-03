var jobConfigs = {
    moduleName: "Job",
    tabs: {
        initShifts: false
    },
    $: {
        recurrence: {
            startTime: $("#AddRecurrenceShiftModal #StartTime"),
            endTime: $("#AddRecurrenceShiftModal #EndTime"),
            duration: $("#AddRecurrenceShiftModal #Duration"),
            isDurationChanging: false,
            isEndTimeChanging: false,
        },
        singular: {
            startTime: $("#AddShiftModal #StartTime"),
            endTime: $("#AddShiftModal #EndTime"),
            duration: $("#AddShiftModal #Duration"),
            isDurationChanging: false,
            isEndTimeChanging: false,
        }
    },
    jobId: null, // must set value for jobId from cshtml file
    attachment: null
};

var jobFunctions = {
    initPage: function (confs) {
        if (confs != null) {
            jobConfigs = Object.assign({}, jobConfigs, confs);
        }

        datatableUtils.configs = jobConfigs;
        jobConfigs.attachment = new JobAttachment("#job-attachments", jobConfigs.jobId);
        jobFunctions.initEvents();

    },
    initEvents: function () {
        // Trigger active tab
        const tabId = $('.nav-tabs li.active a[data-toggle="tab"]').attr("href");
        jobFunctions.triggerEvents(tabId);

        $('.nav-tabs a[data-toggle="tab"]').on("shown.bs.tab", function (e) {
            jobFunctions.triggerEvents($(e.target).attr("href"));
        });

        // recurrence
        jobConfigs.$.recurrence.startTime.on("change", function (date) {
            if (jobConfigs.$.recurrence.duration.val()) {
                jobConfigs.$.recurrence.isDurationChanging = true;
            }
            jobFunctions.helpers.compareTimeRecurrence();
            jobConfigs.$.recurrence.isDurationChanging = false;
        });
        jobConfigs.$.recurrence.endTime.on("change", function (date) {
            if (jobConfigs.$.recurrence.isDurationChanging) return;

            jobConfigs.$.recurrence.isEndTimeChanging = true;
            jobConfigs.$.recurrence.duration.val("-1").trigger("change");
            jobFunctions.helpers.compareTimeRecurrence();
            jobConfigs.$.recurrence.isEndTimeChanging = false;
        });
        jobConfigs.$.recurrence.duration.on("change", function (date) {
            if (jobConfigs.$.recurrence.isEndTimeChanging) return;

            jobConfigs.$.recurrence.isDurationChanging = true;
            jobFunctions.helpers.compareTimeRecurrence();
            jobConfigs.$.recurrence.isDurationChanging = false;
        });

        // singular
        jobConfigs.$.singular.startTime.on("change", function (date) {
            if (jobConfigs.$.singular.duration.val()) {
                jobConfigs.$.singular.isDurationChanging = true;
            }
            jobFunctions.helpers.compareTimeSingular();
            jobConfigs.$.singular.isDurationChanging = false;
        });
        jobConfigs.$.singular.endTime.on("change", function (date) {
            if (jobConfigs.$.singular.isDurationChanging) return;

            jobConfigs.$.singular.isEndTimeChanging = true;
            jobConfigs.$.singular.duration.val("-1").trigger("change");
            jobFunctions.helpers.compareTimeSingular();
            jobConfigs.$.singular.isEndTimeChanging = false;
        });
        jobConfigs.$.singular.duration.on("change", function (date) {
            if (jobConfigs.$.singular.isEndTimeChanging) return;

            jobConfigs.$.singular.isDurationChanging = true;
            jobFunctions.helpers.compareTimeSingular();
            jobConfigs.$.singular.isDurationChanging = false;
        });
    },
    triggerEvents: function (tabId) {
        switch (tabId) {
            case "#job-details": {
                break;
            }
            case "#shifts": {
                if (!jobConfigs.tabs.initShifts) {
                    shiftFunctions.initPage();
                    jobConfigs.tabs.initShifts = true;
                }

                break;
            }
            case "#job-attachments": {
                jobConfigs.attachment.configs.attachmentType = "document";
                jobConfigs.attachment.funcs.initPage(customParam);

                break;
            }
            case "#system-note": {
                break;
            }
            default: {
                break;
            }
        }
    },
    helpers: {
        compareTimeSingular: function () {
            let startTime = jobFunctions.helpers.getTimeAsFloat(jobConfigs.$.singular.startTime.val());
            let duration = jobConfigs.$.singular.duration.val(); // minutes

            if (startTime) {
                startTime = parseFloat(startTime);

                if (duration) {
                    duration = parseFloat(duration);
                    if (duration === -1) return true;

                    let endTime = startTime + parseInt(duration);
                    if (endTime > 24) {
                        endTime = endTime - 24;
                    }
                    let minutes = (duration * 60 % 60) + (parseFloat(endTime) * 60 % 60);

                    minutes = Math.round(minutes);
                    const hours = parseInt(minutes / 60);
                    minutes = minutes % 60;

                    endTime = `${parseInt(endTime) + hours}:${minutes}`;

                    jobConfigs.$.singular.endTime.timepicker("setTime", endTime);
                }
            }

            return true;
        },
        compareTimeRecurrence: function () {
            let startTime = jobFunctions.helpers.getTimeAsFloat(jobConfigs.$.recurrence.startTime.val());
            let duration = jobConfigs.$.recurrence.duration.val(); // minutes

            if (startTime) {
                startTime = parseFloat(startTime);

                if (duration) {
                    duration = parseFloat(duration);
                    if (duration === -1) return true;

                    let endTime = startTime + parseInt(duration);
                    if (endTime > 24) {
                        endTime = endTime - 24;
                    }
                    let minutes = (duration * 60 % 60) + (parseFloat(endTime) * 60 % 60);

                    minutes = Math.round(minutes);
                    const hours = parseInt(minutes / 60);
                    minutes = minutes % 60;

                    endTime = `${parseInt(endTime) + hours}:${minutes}`;

                    jobConfigs.$.recurrence.endTime.timepicker("setTime", endTime);
                }
            }

            return true;
        },
        getTimeAsFloat: function (time) {
            time = time.replace(":", ".");
            if (time[time.length - 1] === ".") {
                time = time.replace(".", "");
            } else {
                const arr = time.split(".");
                time = arr[0] + "." + (parseInt(arr[1]) / 60).toString().split(".")[1];
            }
            return time === "" ? null : time;
        },
        getTimeAsString: function (timeAsFloat) {
            return `${parseInt(timeAsFloat)}:${timeAsFloat * 60 % 60}`;
        }
    }
}
