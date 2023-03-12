Event Notifier
==============

This is a simple Deno serverless function that checks the next n days
for upcoming events and sends a message containing said events to the
user through the `PushBullet <https://pushbullet.com>`__ API

Endpoints
---------

+--------------------------+---------------------------------+---------------------------------------+
| Endpoint                 | Params                          | Function                              |
+==========================+=================================+=======================================+
| ``/checkUpcomingEvents`` | ``days`` - number of days ahead | Check ``days`` days for upcoming      |
|                          | to check                        | events and notify the user            |
+--------------------------+---------------------------------+---------------------------------------+


Environment variables
---------------------

+--------------------+-------------------------------------------------+
| Variable           | Description                                     |
+====================+=================================================+
| PUSHBULLET_API_KEY | Your PushBuller API key obtained                |
|                    | from settings                                   |
+--------------------+-------------------------------------------------+
| GIST_ID            | The ID of the gist where you have               |
|                    | your events.json file stored                    |
+--------------------+-------------------------------------------------+

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
