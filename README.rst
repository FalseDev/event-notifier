Event Notifier
==============

This is a simple Deno serverless function that checks the next n days
for upcoming events and sends a message containing said events to the
user through the `PushBullet <https://pushbullet.com>` API

Endpoints
---------

+---------------------+------------------------------------+-----------------------------------------+
| Endpoint            | Params                             |Function                                 |
+=====================+====================================+=========================================+
| checkUpcomingEvents | ``days`` - number of days ahead to | Check ``days`` days for upcoming events |
|                     | check                              | and notify the user                     |
+---------------------+------------------------------------+-----------------------------------------+


Environment variables
---------------------

+---------------+------------------------------------------------------+
| Variable      | Description                                          |
+===============+======================================================+
| PUSHB         | Your PushBuller API key obtained from settings       |
| ULLET_API_KEY |                                                      |
+---------------+------------------------------------------------------+
| GIST_ID       | The ID of the gist where you have your events.json   |
|               | file stored                                          |
+---------------+------------------------------------------------------+

File Format
-----------

Here is an example file

.. code:: json

   {
       "eventName": [
           {
               "name": "Someone",
               "date": "2023-03-12"
           }
       ]
   }

This generates the message ``Sun Mar 12 2023: eventName of Someone``