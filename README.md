# Serverless Plugin Coding Challenge

Thank you for the opportunity to attempt this challenge.  It has been fun and rewarding.  I haven't had a lot of experience with the Serverless Framework and this was a great opportunity to get a chance to explore what it has to offer.  I am accustomed to working with CloudFormation natively and Serverless is a nice system.  I particularly liked how the hooks allow one to integrate with every micro-step of the process.

To test the project you can add a secret message into `src/deployData.json` and it will be output back to the console.

**NOTE 1** Seting up credentials is not necessary if you have already configured `~/.aws/credentials`.  If not add a `.env` file at the root of this repo with the following keys.  It is important to not have spaces around the `=` sign.
```bash
AWS_ACCESS_KEY_ID='****'
AWS_SECRET_ACCESS_KEY='*****'
```

**NOTE 2** If you already have `~/.aws/config` setup there is nothing further to configure.  The default region is set to `us-east-1` and if your `~/.aws/config` is set for a different default region there will be a conflict.  You can override this by adding `AWS_REGION='***'` to your `.env` mentioned above.


```bash
git clone https://github.com/matthewkeil/serverless-plugin-challenge.git
cd serverless-plugin-challenge
npm i
npm run deploy
npm run remove
```

## Development Methodology
I am very comfortable with a breadth of AWS's services and CloudFormation so I wanted to focus on the details of the Serverless Framework.  Some of the more nuanced challenges in working with AWS are in handling the context during the build and deploy process.  Being able to effectively move between templates and SDK scripting can make the difference in being able to complete a particularly challenging deploy.

I took a bit of a Rube Goldberg approach to show some examples of data flowing around between different parts of the application and infrastructure.  The process is kicked off by the transpilation process and is followed up with a pre-deploy script.  It is common to script-build templates and I wanted to highlight that fact.  The deploy then comences and stands a stack with a Dynamo table and the Lambda that will execute the s3->dynamo action.  The lambda is a simple Handler and was not setup to react to any events.  It simply takes an event body that contains the S3 object key, that is to be retrieved, and returns the uuid of the inserted dynamoDb item.  The post-deploy plugin is regestered to call the lambda after finalization and cleanup of the deploy process.  The S3 key is passed into the post-deploy plugin using the `custom` portion of the serverless.yml and it calls the lambda with the key it should fetch.  The uuid returned from the lambda is then used by the plugin to retrieve the object from dynamo.  The secret message is displayed on the terminal.

As a stretch goal I wanted to show an example of inter-stack asset management.  I am partial to clutter on the AWS console and am not inclined to have a million buckets for a particular service. Creating a single bucket that all stages work out of is a nice solution to this problem.  I chose to script build the deploy bucket and then write the bucketName into the serverless.yml prior to the deployment.  In order to clean up the resource, after its not longer needed, I used a separate plugin that hooks into `remove:remove` and checks to see if any of the service stacks are still active.  If not the plugin empties the service bucket and deletes it.  Its a good example of how managing dynamic state can be achieved through a mix of IaaC and scripted processes, where ultimately the active state is represented in the template and under source control.